import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { GenerateChatResponseUseCase } from '@/ai/application/useCases/generateChatResponse.useCase';
import { AiChatRequest } from '@/ai/domain/entities/AiChatRequest.entity';
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
    private readonly generateChatResponseUseCase: GenerateChatResponseUseCase,
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

    const createdUserMessage = await this.chatRepository.createMessage(message);

    const aiResponse = await this.generateChatResponseUseCase.execute(
      new AiChatRequest(
        message.conversationId,
        message.content,
        message.senderId,
      ),
    );

    const assistantMessage = new ChatMessage(
      randomUUID(),
      message.conversationId,
      'ai-assistant',
      'AI Assistant',
      aiResponse.data.content,
      new Date(),
    );

    const createdAssistantMessage =
      await this.chatRepository.createMessage(assistantMessage);

    return okResponse(
      {
        userMessage: createdUserMessage,
        assistantMessage: createdAssistantMessage,
        ai: aiResponse.data,
      },
      'Send message and generate AI response successfully',
    );
  }
}
