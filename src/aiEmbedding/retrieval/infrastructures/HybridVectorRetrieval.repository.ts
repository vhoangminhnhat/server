import { IEmbeddingProviderRepository } from '@/aiEmbedding/providers/domains/EmbeddingProviderRepository';
import { EmbeddingProviderToken } from '@/aiEmbedding/shared/tokens/aiModelProviders/EmbeddingProvider.token';
import { PrismaService } from '@/prisma/prisma.service';
import { Inject, Injectable } from '@nestjs/common';
import { RetrievedDocument } from '../domains/entities/RetrievedDocument.entity';
import { IRetrievalRepository } from '../domains/repositories/RetrievalRepository.interface';

@Injectable()
export class HybridVectorRetrievalRepository implements IRetrievalRepository {
  private readonly maxVectorCandidates = 500;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(EmbeddingProviderToken.EMBEDDING_PROVIDER)
    private readonly embeddingProvider: IEmbeddingProviderRepository,
  ) {}

  async searchRelevantDocuments(
    query: string,
    limit: number,
  ): Promise<RetrievedDocument[]> {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return [];
    }

    const terms = this.extractTerms(normalizedQuery);
    const queryEmbedding =
      await this.embeddingProvider.embedText(normalizedQuery);
    const candidateChunks = await this.findCandidateChunks(terms, limit);

    const retrievedDocuments = candidateChunks.map((chunk: any) => {
      const chunkEmbedding = this.toNumberVector(chunk.embedding);
      const keywordScore = this.scoreKeyword(chunk.searchText || '', terms);
      const vectorScore = this.scoreVector(queryEmbedding, chunkEmbedding);
      const score = this.combineScores(keywordScore, vectorScore);

      return new RetrievedDocument({
        id: chunk.id,
        title: chunk.title,
        source: chunk.source || `document:${chunk.documentId}`,
        content: chunk.content,
        relevanceScore: score,
        metadata: {
          documentId: chunk.documentId,
          chunkIndex: chunk.chunkIndex,
          retrievalType: 'hybrid-vector',
          keywordScore,
          vectorScore,
        },
      });
    });

    return retrievedDocuments
      .filter(
        (document: RetrievedDocument) => (document.relevanceScore || 0) > 0,
      )
      .sort(
        (a: RetrievedDocument, b: RetrievedDocument) =>
          (b.relevanceScore || 0) - (a.relevanceScore || 0),
      )
      .slice(0, limit);
  }

  private async findCandidateChunks(
    terms: string[],
    limit: number,
  ): Promise<any[]> {
    const take = Math.min(Math.max(limit * 40, 80), this.maxVectorCandidates);
    const keywordCandidates = terms.length
      ? await (this.prisma as any).aiDocumentChunk.findMany({
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
          take,
        })
      : [];

    const vectorCandidates = await (
      this.prisma as any
    ).aiDocumentChunk.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take,
    });

    const byId = new Map<string, any>();

    for (const chunk of [...keywordCandidates, ...vectorCandidates]) {
      byId.set(chunk.id, chunk);
    }

    return Array.from(byId.values());
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
        this.normalizeText(query)
          .split(/[^\p{L}\p{N}]+/u)
          .map((term) => term.trim())
          .filter((term) => term.length >= 2 && !stopWords.has(term)),
      ),
    );
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd');
  }

  private scoreKeyword(searchText: string, terms: string[]): number {
    if (!searchText || !terms.length) {
      return 0;
    }

    const normalizedSearchText = this.normalizeText(searchText);
    const matchedTerms = terms.filter((term) =>
      normalizedSearchText.includes(term),
    );
    const coverage = matchedTerms.length / Math.max(terms.length, 1);
    const density =
      matchedTerms.reduce(
        (total, term) =>
          total + this.countOccurrences(normalizedSearchText, term),
        0,
      ) / Math.max(normalizedSearchText.length / 1000, 1);

    return Number(
      (coverage * 0.8 + Math.min(density / 10, 1) * 0.2).toFixed(4),
    );
  }

  private scoreVector(
    queryEmbedding: number[],
    chunkEmbedding: unknown,
  ): number {
    const embedding = this.toNumberVector(chunkEmbedding);

    if (!queryEmbedding.length || !embedding.length) {
      return 0;
    }

    const length = Math.min(queryEmbedding.length, embedding.length);
    let dotProduct = 0;

    for (let index = 0; index < length; index += 1) {
      dotProduct += queryEmbedding[index] * embedding[index];
    }

    return Number(Math.max(0, dotProduct).toFixed(4));
  }

  private toNumberVector(value: unknown): number[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter((item): item is number => typeof item === 'number');
  }

  private combineScores(keywordScore: number, vectorScore: number): number {
    return Number((vectorScore * 0.65 + keywordScore * 0.35).toFixed(4));
  }

  private countOccurrences(text: string, term: string): number {
    return text.split(term).length - 1;
  }
}
