import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IMemoryRepository } from '@/ai/domain/interface/memoryRepository.interface';
import { MemoryRepositoryToken } from '@/ai/domain/token/memoryRepository.token';
import { MemoryRecord } from '@/ai/domain/entities/MemoryRecord.entity';
import { AiChatRequest } from '@/ai/domain/entities/AiChatRequest.entity';

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
