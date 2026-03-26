import { Injectable } from '@nestjs/common';
import { CreateMessageUseCase } from '@/chat/application/createMessage.useCase';
import { GetMessagesUseCase } from '@/chat/application/getMessages.useCase';

@Injectable()
export class ChatToolAdapter {
  constructor(
    private readonly createMessageUseCase: CreateMessageUseCase,
    private readonly getMessagesUseCase: GetMessagesUseCase,
  ) {}

  async getMessages(args: Record<string, unknown>) {
    const response = await this.getMessagesUseCase.execute(
      String(args.conversationId || 'global'),
      Number(args.limit || 50),
    );

    return response.data || [];
  }

  async sendMessage(args: Record<string, unknown>) {
    const response = await this.createMessageUseCase.execute({
      conversationId: String(args.conversationId || 'global'),
      senderId: String(args.senderId || 'mcp-tool'),
      senderName: String(args.senderName || 'MCP Tool'),
      content: String(args.content || ''),
    });

    return response.data || {};
  }
}
