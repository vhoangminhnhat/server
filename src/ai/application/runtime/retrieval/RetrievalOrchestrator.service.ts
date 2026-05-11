import { RetrievedDocument } from '@/ai/domain/entities/RetrievedDocument.entity';
import { IRetrievalRepository } from '@/ai/domain/interface/retrievalRepository.interface';
import { RetrievalProviderToken } from '@/ai/domain/token/RetrievalProvider.token';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class RetrievalOrchestratorService {
  constructor(
    @Inject(RetrievalProviderToken.RETRIEVAL_PROVIDER)
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
