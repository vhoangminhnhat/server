import { IsOptional, IsString } from 'class-validator';

export class GetChatMessagesDto {
  @IsString()
  @IsOptional()
  conversationId?: string;

  @IsString()
  @IsOptional()
  limit?: string;
}
