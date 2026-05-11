import { Body, Controller, Post } from '@nestjs/common';
import { AiChatRequest } from './domain/entities/AiChatRequest.entity';
import { GenerateAiChatDto } from './dto/generateAiChat.dto';
import { GenerateChatResponseUseCase } from './application/useCases/generateChatResponse.useCase';
import { ImportDocumentUseCase } from './application/useCases/importDocument.useCase';
import { ImportAiDocumentDto } from './dto/importAiDocument.dto';

@Controller('ai')
export class AiController {
  constructor(
    private readonly generateChatResponseUseCase: GenerateChatResponseUseCase,
    private readonly importDocumentUseCase: ImportDocumentUseCase,
  ) {}

  @Post('chat/complete')
  async generateChatResponse(@Body() dto: GenerateAiChatDto) {
    return this.generateChatResponseUseCase.execute(
      new AiChatRequest(
        dto.conversationId || 'global',
        dto.message?.trim() || '',
        dto.userId,
      ),
    );
  }

  @Post('documents/import')
  async importDocument(@Body() dto: ImportAiDocumentDto) {
    return this.importDocumentUseCase.execute(dto);
  }
}
