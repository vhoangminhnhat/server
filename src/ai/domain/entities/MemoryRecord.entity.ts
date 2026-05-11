export class MemoryRecord {
  id?: string;
  conversationId?: string;
  content?: string;
  memoryType?: string;
  userId?: string;
  score?: number;
  createdAt?: Date = new Date();

  constructor(data?: Partial<MemoryRecord>) {
    this.id = data?.id;
    this.conversationId = data?.conversationId;
    this.content = data?.content;
    this.memoryType = data?.memoryType;
    this.userId = data?.userId;
    this.score = data?.score;
    this.createdAt = data?.createdAt;
  }
}
