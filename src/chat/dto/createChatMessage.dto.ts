import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateChatMessageDto {
  @IsString()
  @IsOptional()
  conversationId?: string;

  @IsString()
  @IsOptional()
  senderId?: string;

  @IsString()
  @IsOptional()
  senderName?: string;

  @IsString()
  @MinLength(1)
  content?: string;
}
