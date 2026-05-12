import { Body, Controller, Post } from '@nestjs/common';
import { GenerateChatResponseUseCase } from '../applications/GenerateChat.useCase';
import { AiChatRequest } from '../domains/entities/aiChats/AiChatRequest.entity';
import { GenerateAiChatDto } from './dtos/GenerateAiChat.dto';

@Controller('ai/chat')
export class AiChatController {
  constructor(
    private readonly generateChatResponseUseCase: GenerateChatResponseUseCase,
  ) {}

  @Post('complete')
  async generateChatResponse(@Body() dto: GenerateAiChatDto) {
    return this.generateChatResponseUseCase.execute(
      new AiChatRequest(
        dto.conversationId || 'global',
        dto.message?.trim() || '',
        dto.userId,
      ),
    );
  }
}
