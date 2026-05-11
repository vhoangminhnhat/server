import { okResponse } from '@/common/models/apiResponse.model';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AiDocument } from '../../domain/entities/AiDocument.entity';
import { AiDocumentChunk } from '../../domain/entities/AiDocumentChunk.entity';
import { IDocumentRepository } from '../../domain/interface/documentRepository.interface';
import { DocumentRepositoryToken } from '../../domain/token/documentRepository.token';
import { ImportAiDocumentDto } from '../../dto/importAiDocument.dto';

@Injectable()
export class ImportDocumentUseCase {
  private readonly maxChunkLength = 1800;
  private readonly chunkOverlap = 220;

  constructor(
    @Inject(DocumentRepositoryToken.DOCUMENT_REPOSITORY)
    private readonly documentRepository: IDocumentRepository,
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

    const chunks = this.chunkContent(content).map(
      (chunkContent, index) =>
        new AiDocumentChunk({
          id: randomUUID(),
          documentId: document.id,
          chunkIndex: index,
          title,
          source: document.source,
          content: chunkContent,
          searchText: this.toSearchText([title, document.source, chunkContent]),
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
