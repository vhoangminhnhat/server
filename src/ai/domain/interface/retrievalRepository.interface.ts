import { RetrievedDocument } from '../entities/RetrievedDocument.entity';

export interface IRetrievalRepository {
  searchRelevantDocuments(
    query: string,
    limit: number,
  ): Promise<RetrievedDocument[]>;
}
