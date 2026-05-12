import { okResponse } from '@/common/models/apiResponse.model';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AiDocument } from '../../domain/entities/AiDocument.entity';
import { AiDocumentChunk } from '../../domain/entities/AiDocumentChunk.entity';
import { IDocumentRepository } from '../../domain/interface/documentRepository.interface';
import { IEmbeddingProvider } from '../../domain/interface/embeddingProvider.interface';
import { DocumentRepositoryToken } from '../../domain/token/documentRepository.token';
import { EmbeddingProviderToken } from '../../domain/token/embeddingProvider.token';
import { ImportAiDocumentDto } from '../../dto/importAiDocument.dto';

@Injectable()
export class ImportDocumentUseCase {
  private readonly maxChunkLength = 1800;
  private readonly chunkOverlap = 220;
  private readonly legalArticlePattern = /^Điều\s+\d+[a-zA-Z]?\s*[.:]/iu;
  private readonly legalHeadingPattern =
    /^(Chương|Mục|Tiểu mục|Phần)\s+([IVXLCDM]+|\d+)/iu;
  private readonly legalClausePattern = /^\d+\.\s+/u;
  private readonly legalPointPattern = /^[a-zđ]\)\s+/iu;

  constructor(
    @Inject(DocumentRepositoryToken.DOCUMENT_REPOSITORY)
    private readonly documentRepository: IDocumentRepository,
    @Inject(EmbeddingProviderToken.EMBEDDING_PROVIDER)
    private readonly embeddingProvider: IEmbeddingProvider,
  ) {}

  async execute(dto: ImportAiDocumentDto) {
    const title = dto.title?.trim();
    const content = this.normalizeContent(dto.content || '');

    if (!title) {
      throw new BadRequestException('Document title is required');
    }

    if (!content) {
      throw new BadRequestException('Document content is required');
    }

    const document = new AiDocument({
      id: randomUUID(),
      title,
      source: dto.source?.trim() || undefined,
      content,
      userId: dto.userId?.trim() || undefined,
      createdAt: new Date(),
    });

    const chunkContents = this.chunkContent(content);
    const embeddings = await Promise.all(
      chunkContents.map((chunkContent) =>
        this.embeddingProvider.embedText(
          this.toSearchText([title, document.source, chunkContent]),
        ),
      ),
    );

    const chunks = chunkContents.map(
      (chunkContent, index) =>
        new AiDocumentChunk({
          id: randomUUID(),
          documentId: document.id,
          chunkIndex: index,
          title,
          source: document.source,
          content: chunkContent,
          searchText: this.toSearchText([title, document.source, chunkContent]),
          embedding: embeddings[index],
          userId: document.userId,
          createdAt: new Date(),
        }),
    );

    const created = await this.documentRepository.saveDocumentWithChunks(
      document,
      chunks,
    );

    return okResponse(
      {
        ...created,
        chunkCount: chunks.length,
      },
      'Import AI document successfully',
    );
  }

  private normalizeContent(content: string): string {
    return content
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private chunkContent(content: string): string[] {
    const legalChunks = this.chunkLegalContent(content);

    if (legalChunks.length) {
      return legalChunks;
    }

    return this.chunkParagraphContent(content);
  }

  private chunkLegalContent(content: string): string[] {
    const lines = content.split('\n');
    const chunks: string[] = [];
    const activeHeadings: string[] = [];
    const preamble: string[] = [];
    let currentArticle: string[] = [];
    let currentArticleHeadings: string[] = [];
    let hasArticle = false;

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (!trimmedLine) {
        this.appendLegalLine(hasArticle ? currentArticle : preamble, line);
        continue;
      }

      if (this.isLegalArticleHeading(trimmedLine)) {
        if (currentArticle.length) {
          chunks.push(
            ...this.finalizeLegalArticle(
              currentArticleHeadings,
              currentArticle,
            ),
          );
        }

        hasArticle = true;
        currentArticleHeadings = [...activeHeadings];
        currentArticle = [trimmedLine];
        continue;
      }

      if (this.isLegalSectionHeading(trimmedLine)) {
        if (currentArticle.length) {
          chunks.push(
            ...this.finalizeLegalArticle(
              currentArticleHeadings,
              currentArticle,
            ),
          );
          currentArticle = [];
        }

        this.updateActiveHeadings(activeHeadings, trimmedLine);

        if (!hasArticle) {
          preamble.push(trimmedLine);
        }

        continue;
      }

      if (hasArticle) {
        this.appendLegalLine(currentArticle, line);
      } else {
        this.appendLegalLine(preamble, line);
      }
    }

    if (currentArticle.length) {
      chunks.push(
        ...this.finalizeLegalArticle(currentArticleHeadings, currentArticle),
      );
    }

    if (!hasArticle) {
      return [];
    }

    const preambleText = preamble.join('\n').trim();

    if (preambleText) {
      return [...this.splitOversizedText(preambleText), ...chunks].filter(
        Boolean,
      );
    }

    return chunks.filter(Boolean);
  }

  private appendLegalLine(target: string[], line: string): void {
    const trimmedLine = line.trim();
    const lastLine = target[target.length - 1];

    if (!trimmedLine && !lastLine) {
      return;
    }

    target.push(trimmedLine);
  }

  private isLegalArticleHeading(line: string): boolean {
    return this.legalArticlePattern.test(line);
  }

  private isLegalSectionHeading(line: string): boolean {
    return this.legalHeadingPattern.test(line);
  }

  private updateActiveHeadings(
    activeHeadings: string[],
    heading: string,
  ): void {
    const level = this.getLegalHeadingLevel(heading);

    activeHeadings.splice(level - 1);
    activeHeadings[level - 1] = heading;
  }

  private getLegalHeadingLevel(heading: string): number {
    if (/^Phần\b/iu.test(heading)) {
      return 1;
    }

    if (/^Chương\b/iu.test(heading)) {
      return 2;
    }

    if (/^Mục\b/iu.test(heading)) {
      return 3;
    }

    return 4;
  }

  private finalizeLegalArticle(
    headings: string[],
    articleLines: string[],
  ): string[] {
    const articleText = articleLines.join('\n').trim();
    const context = headings.join('\n').trim();
    const withContext = [context, articleText].filter(Boolean).join('\n');

    if (withContext.length <= this.maxChunkLength) {
      return [withContext];
    }

    return this.chunkOversizedArticle(headings, articleLines);
  }

  private chunkOversizedArticle(
    headings: string[],
    articleLines: string[],
  ): string[] {
    const articleHeading = articleLines[0] || '';
    const bodyLines = articleLines.slice(1);
    const clauseGroups = this.groupLegalClauses(bodyLines);

    if (!clauseGroups.length) {
      return this.splitOversizedText(
        [headings.join('\n'), articleHeading, bodyLines.join('\n')]
          .filter(Boolean)
          .join('\n'),
      );
    }

    const prefix = [headings.join('\n'), articleHeading]
      .filter(Boolean)
      .join('\n');
    const chunks: string[] = [];
    let current = prefix;

    for (const group of clauseGroups) {
      const groupText = group.join('\n').trim();
      const next = [current, groupText].filter(Boolean).join('\n');

      if (next.length > this.maxChunkLength && current !== prefix) {
        chunks.push(current.trim());
        current = [prefix, groupText].filter(Boolean).join('\n');
      } else {
        current = next;
      }

      if (current.length > this.maxChunkLength) {
        chunks.push(...this.splitOversizedText(current));
        current = prefix;
      }
    }

    if (current.trim() && current !== prefix) {
      chunks.push(current.trim());
    }

    return chunks;
  }

  private groupLegalClauses(lines: string[]): string[][] {
    const groups: string[][] = [];
    let current: string[] = [];
    const hasNumberedClause = lines.some((line) =>
      this.legalClausePattern.test(line.trim()),
    );

    for (const line of lines) {
      const trimmedLine = line.trim();
      const startsNewClause = hasNumberedClause
        ? this.legalClausePattern.test(trimmedLine)
        : this.legalPointPattern.test(trimmedLine);

      if (startsNewClause && current.length) {
        groups.push(current);
        current = [trimmedLine];
        continue;
      }

      if (trimmedLine || current.length) {
        current.push(trimmedLine);
      }
    }

    if (current.length) {
      groups.push(current);
    }

    return groups;
  }

  private splitOversizedText(text: string): string[] {
    const chunks: string[] = [];
    let current = text.trim();

    while (current.length > this.maxChunkLength) {
      const splitIndex = this.findLegalSplitIndex(current);

      chunks.push(current.slice(0, splitIndex).trim());
      current = current
        .slice(Math.max(splitIndex - this.chunkOverlap, 0))
        .trim();
    }

    if (current) {
      chunks.push(current);
    }

    return chunks;
  }

  private findLegalSplitIndex(text: string): number {
    const limit = this.maxChunkLength;
    const windowStart = Math.floor(limit * 0.65);
    const candidate = text.slice(windowStart, limit);
    const separators = ['\n\n', '\n', '. ', '; '];

    for (const separator of separators) {
      const index = candidate.lastIndexOf(separator);

      if (index >= 0) {
        return windowStart + index + separator.length;
      }
    }

    return limit;
  }

  private chunkParagraphContent(content: string): string[] {
    const paragraphs = content.split(/\n{2,}/).map((part) => part.trim());
    const chunks: string[] = [];
    let current = '';

    for (const paragraph of paragraphs) {
      if (!paragraph) {
        continue;
      }

      if ((current + '\n\n' + paragraph).trim().length > this.maxChunkLength) {
        if (current) {
          chunks.push(current.trim());
        }

        current = paragraph;
      } else {
        current = [current, paragraph].filter(Boolean).join('\n\n');
      }

      while (current.length > this.maxChunkLength) {
        chunks.push(current.slice(0, this.maxChunkLength).trim());
        current = current.slice(this.maxChunkLength - this.chunkOverlap).trim();
      }
    }

    if (current) {
      chunks.push(current.trim());
    }

    return chunks.length ? chunks : [content];
  }

  private toSearchText(parts: Array<string | undefined>): string {
    return parts.filter(Boolean).join(' ').toLowerCase();
  }
}
