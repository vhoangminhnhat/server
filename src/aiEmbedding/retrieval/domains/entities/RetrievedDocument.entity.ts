export class RetrievedDocument {
  id?: string;
  title?: string;
  source?: string;
  content?: string;
  relevanceScore?: number;
  metadata?: Record<string, unknown>;

  constructor(data?: Partial<RetrievedDocument>) {
    Object.assign(this, data);
  }
}
