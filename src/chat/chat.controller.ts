import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwtAuth.guard';
import { CreateMessageUseCase } from './application/createMessage.useCase';
import { GetMessagesUseCase } from './application/getMessages.useCase';
import { CreateChatMessageDto } from './dto/createChatMessage.dto';
import { GetChatMessagesDto } from './dto/getChatMessages.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly createMessageUseCase: CreateMessageUseCase,
    private readonly getMessagesUseCase: GetMessagesUseCase,
  ) {}

  @Get('messages')
  async getMessages(@Query() query: GetChatMessagesDto) {
    const parsedLimit = Number.parseInt(query.limit || '50', 10);
    return this.getMessagesUseCase.execute(query.conversationId, parsedLimit);
  }

  @Post('messages')
  async createMessage(@Body() dto: CreateChatMessageDto) {
    return this.createMessageUseCase.execute(dto);
  }
}
