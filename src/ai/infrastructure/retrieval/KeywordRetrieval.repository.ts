import { RetrievedDocument } from '@/ai/domain/entities/RetrievedDocument.entity';
import { IRetrievalRepository } from '@/ai/domain/interface/retrievalRepository.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class KeywordRetrievalRepository implements IRetrievalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async searchRelevantDocuments(
    query: string,
    limit: number,
  ): Promise<RetrievedDocument[]> {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return [];
    }

    const terms = this.extractTerms(normalizedQuery);

    if (!terms.length) {
      return [];
    }

    const candidateChunks = await (this.prisma as any).aiDocumentChunk.findMany(
      {
        where: {
          OR: terms.slice(0, 8).map((term) => ({
            searchText: {
              contains: term,
              mode: 'insensitive',
            },
          })),
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: Math.max(limit * 8, 20),
      },
    );

    const retrievedDocuments: RetrievedDocument[] = candidateChunks
      .map((chunk: any) => {
        const score = this.scoreChunk(chunk.searchText || '', terms);

        return new RetrievedDocument({
          id: chunk.id,
          title: chunk.title,
          source: chunk.source || `document:${chunk.documentId}`,
          content: chunk.content,
          relevanceScore: score,
          metadata: {
            documentId: chunk.documentId,
            chunkIndex: chunk.chunkIndex,
            retrievalType: 'keyword',
          },
        });
      })
      .filter(
        (document: RetrievedDocument) => (document.relevanceScore || 0) > 0,
      );

    const sortedDocuments = retrievedDocuments.sort(
      (a: RetrievedDocument, b: RetrievedDocument) =>
        (b.relevanceScore || 0) - (a.relevanceScore || 0),
    );

    return sortedDocuments.slice(0, limit);
  }

  private extractTerms(query: string): string[] {
    const stopWords = new Set([
      'anh',
      'chi',
      'cho',
      'cua',
      'cac',
      'mot',
      'nhung',
      'the',
      'and',
      'are',
      'for',
      'from',
      'that',
      'this',
      'with',
    ]);

    return Array.from(
      new Set(
        query
          .toLowerCase()
          .split(/[^\p{L}\p{N}]+/u)
          .map((term) => term.trim())
          .filter((term) => term.length >= 2 && !stopWords.has(term)),
      ),
    );
  }

  private scoreChunk(searchText: string, terms: string[]): number {
    if (!searchText) {
      return 0;
    }

    const matchedTerms = terms.filter((term) => searchText.includes(term));
    const coverage = matchedTerms.length / Math.max(terms.length, 1);
    const density =
      matchedTerms.reduce(
        (total, term) => total + this.countOccurrences(searchText, term),
        0,
      ) / Math.max(searchText.length / 1000, 1);

    return Number(
      (coverage * 0.8 + Math.min(density / 10, 1) * 0.2).toFixed(4),
    );
  }

  private countOccurrences(text: string, term: string): number {
    return text.split(term).length - 1;
  }
}
