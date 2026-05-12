import { AiChatRequest } from '@/aiEmbedding/chat/domains/entities/aiChats/AiChatRequest.entity';
import { MemoryRepositoryToken } from '@/aiEmbedding/shared/tokens/memories/MemoryRepository.token';
import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { MemoryRecord } from '../domains/entities/MemoryRecord.entity';
import { IMemoryRepository } from '../domains/repositories/MemoryRepository.interface';

@Injectable()
export class ConversationMemoryService {
  constructor(
    @Inject(MemoryRepositoryToken.MEMORY_REPOSITORY)
    private readonly memoryRepository: IMemoryRepository,
  ) {}
  /**
   * =========================================================
   * RETRIEVE RELEVANT MEMORIES
   * =========================================================
   */

  async retrieveRelevantMemories(
    conversationId: string,
    userId?: string,
  ): Promise<MemoryRecord[]> {
    return this.memoryRepository.getConversationMemories(
      conversationId,
      userId,
    );
  }

  /**
   * =========================================================
   * EXTRACT AND STORE MEMORY
   * =========================================================
   */

  async consolidateMemory(
    request: AiChatRequest,
  ): Promise<MemoryRecord | null> {
    const extractedMemory = this.extractMemory(request);

    if (!extractedMemory) {
      return null;
    }

    return this.memoryRepository.saveMemory(extractedMemory);
  }

  /**
   * =========================================================
   * MEMORY EXTRACTION LOGIC
   * =========================================================
   */

  private extractMemory(request: AiChatRequest): MemoryRecord | null {
    const normalizedMessage = request.message.trim();

    const shouldStore =
      normalizedMessage.length > 20 &&
      /(prefer|remember|project|goal|important)/i.test(normalizedMessage);

    if (!shouldStore) {
      return null;
    }

    return new MemoryRecord({
      id: randomUUID(),
      conversationId: request?.conversationId,
      content: normalizedMessage,
      memoryType: 'LONG_TERM_FACT',
      userId: request?.userId,
      score: 0.75,
    });
  }
}
