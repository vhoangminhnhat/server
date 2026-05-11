import { AiDocument } from '../entities/AiDocument.entity';
import { AiDocumentChunk } from '../entities/AiDocumentChunk.entity';

export interface IDocumentRepository {
  saveDocumentWithChunks(
    document: AiDocument,
    chunks: AiDocumentChunk[],
  ): Promise<AiDocument>;
}
