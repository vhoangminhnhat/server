import { RetrievalRepositoryToken } from '@/aiEmbedding/shared/tokens/retrievals/RetrievalRepository.token';
import { Inject, Injectable } from '@nestjs/common';
import { RetrievedDocument } from '../domains/entities/RetrievedDocument.entity';
import { IRetrievalRepository } from '../domains/repositories/RetrievalRepository.interface';

@Injectable()
export class RetrievalOrchestratorService {
  constructor(
    @Inject(RetrievalRepositoryToken.RETRIEVAL_PROVIDER)
    private readonly retrievalProvider: IRetrievalRepository,
  ) {}

  async retrieveRelevantDocuments(
    query: string,
    limit: number,
  ): Promise<RetrievedDocument[]> {
    const documents = await this.retrievalProvider.searchRelevantDocuments(
      query,
      limit,
    );

    return documents
      .filter((document) => !!document.content)
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  }
}
