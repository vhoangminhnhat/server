import { AiChatResponse } from '../entities/aiChats/AiChatResponse.entity';
import { PromptContext } from '../entities/promptContexts/PromptContext.entity';

export interface IAiModelProviderRepository {
  generateResponse(context: PromptContext): Promise<AiChatResponse>;
}
