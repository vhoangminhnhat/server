export class AiDocumentChunk {
  id?: string;
  documentId?: string;
  chunkIndex?: number;
  title?: string;
  source?: string;
  content?: string;
  searchText?: string;
  userId?: string;
  createdAt?: Date;

  constructor(data?: Partial<AiDocumentChunk>) {
    Object.assign(this, data);
  }
}
