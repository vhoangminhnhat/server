import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { okResponse } from '@/common/models/apiResponse.model';
import { ChatMessage } from '../domain/entity/chatMessage.entity';
import { IChatRepository } from '../domain/interface/chat.repository.interface';
import { ChatToken } from '../domain/token/chat.repository.token';
import { CreateChatMessageDto } from '../dto/createChatMessage.dto';

@Injectable()
export class CreateMessageUseCase {
  constructor(
    @Inject(ChatToken.CHAT_REPOSITORY)
    private readonly chatRepository: IChatRepository,
  ) {}

  async execute(dto: CreateChatMessageDto) {
    const content = dto.content?.trim();

    if (!content) {
      throw new BadRequestException('Message content is required');
    }

    const message = new ChatMessage(
      randomUUID(),
      dto.conversationId?.trim() || 'global',
      dto.senderId?.trim() || 'anonymous',
      dto.senderName?.trim() || 'Anonymous',
      content,
      new Date(),
    );

    const created = await this.chatRepository.createMessage(message);
    return okResponse(created, 'Send message successfully');
  }
}
