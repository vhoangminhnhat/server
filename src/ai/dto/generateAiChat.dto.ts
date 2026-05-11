import { IsOptional, IsString, MinLength } from 'class-validator';

export class GenerateAiChatDto {
  @IsString()
  conversationId?: string;

  @IsString()
  @MinLength(1)
  message?: string;

  @IsString()
  @IsOptional()
  userId?: string;
}
