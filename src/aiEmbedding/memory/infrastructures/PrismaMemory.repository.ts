import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { MemoryRecord } from '../domains/entities/MemoryRecord.entity';
import { IMemoryRepository } from '../domains/repositories/MemoryRepository.interface';

@Injectable()
export class PrismaMemoryRepository implements IMemoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getConversationMemories(
    conversationId: string,
    userId?: string,
  ): Promise<MemoryRecord[]> {
    const memories = await (this.prisma as any).memory.findMany({
      where: {
        conversationId,
        ...(userId && {
          userId,
        }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return memories.map(
      (memory: any) =>
        new MemoryRecord({
          id: memory?.id,
          conversationId: memory?.conversationId,
          content: memory?.content,
          memoryType: memory?.memoryType,
          userId: memory?.userId,
        }),
    );
  }

  async saveMemory(memory: MemoryRecord): Promise<MemoryRecord> {
    const savedMemory = await (this.prisma as any).memory.create({
      data: {
        createdAt: new Date(),
        id: memory.id,
        conversationId: memory.conversationId,
        content: memory.content,
        memoryType: memory.memoryType,
        userId: memory.userId,
      },
    });

    return new MemoryRecord({
      createdAt: savedMemory?.createdAt,
      id: savedMemory?.id,
      conversationId: savedMemory?.conversationId,
      content: savedMemory?.content,
      memoryType: savedMemory?.memoryType,
      userId: savedMemory?.userId,
    });
  }
}
