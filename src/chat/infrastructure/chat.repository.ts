import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ChatMessage } from '../domain/entity/chatMessage.entity';
import { IChatRepository } from '../domain/interface/chat.repository.interface';

@Injectable()
export class ChatRepository implements IChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getMessages(conversationId: string, limit: number): Promise<ChatMessage[]> {
    const records = await this.prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return records
      .map(
        (record) =>
          new ChatMessage(
            record.id,
            record.conversationId,
            record.senderId,
            record.senderName,
            record.content,
            record.createdAt,
          ),
      )
      .reverse();
  }

  async createMessage(message: ChatMessage): Promise<ChatMessage> {
    const created = await this.prisma.chatMessage.create({
      data: {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        senderName: message.senderName,
        content: message.content,
        createdAt: message.createdAt,
      },
    });

    return new ChatMessage(
      created.id,
      created.conversationId,
      created.senderId,
      created.senderName,
      created.content,
      created.createdAt,
    );
  }
}
