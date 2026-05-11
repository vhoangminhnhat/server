import { MemoryRecord } from '../entities/MemoryRecord.entity';

export interface IMemoryRepository {
  getConversationMemories(
    conversationId: string,
    userId?: string,
  ): Promise<MemoryRecord[]>;
  saveMemory(memory: MemoryRecord): Promise<MemoryRecord>;
}
