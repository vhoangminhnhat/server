import { AiChatResponse } from '../entities/AiChatResponse.entity';
import { PromptContext } from '../entities/PromptContext.entity';

export interface IAiModelProvider {
  generateResponse(context: PromptContext): Promise<AiChatResponse>;
}
