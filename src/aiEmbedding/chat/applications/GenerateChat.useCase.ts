import { ConversationMemoryService } from '@/aiEmbedding/memory/applications/ConversationMemory.service';
import { AiModelProviderToken } from '@/aiEmbedding/shared/tokens/aiModelProviders/AiModelProvider.token';
import { okResponse } from '@/common/models/apiResponse.model';
import { Inject, Injectable } from '@nestjs/common';
import { AiChatRequest } from '../domains/entities/aiChats/AiChatRequest.entity';
import { IAiModelProviderRepository } from '../domains/repositories/AiModelProviderRepository';
import { PromptContextBuilderService } from './PromptContextBuilder.service';
import { TokenBudgetStrategyService } from './TokenBudgetStrategy.service';

@Injectable()
export class GenerateChatResponseUseCase {
  constructor(
    @Inject(AiModelProviderToken.AI_MODEL_PROVIDER)
    private readonly aiModelProvider: IAiModelProviderRepository,
    private readonly conversationMemoryService: ConversationMemoryService,
    private readonly tokenBudgetStrategyService: TokenBudgetStrategyService,
    private readonly promptContextBuilderService: PromptContextBuilderService,
  ) {}

  async execute(request: AiChatRequest) {
    /**
     * =========================================================
     * RETRIEVE CONVERSATION MEMORIES
     * =========================================================
     */

    const memories =
      await this.conversationMemoryService.retrieveRelevantMemories(
        request.conversationId,
        request.userId,
      );

    /**
     * =========================================================
     * BUILD TOKEN BUDGET STRATEGY
     * =========================================================
     */

    const tokenBudget = this.tokenBudgetStrategyService.createBudget();

    /**
     * =========================================================
     * BUILD PROMPT CONTEXT
     * =========================================================
     */

    const promptContext = await this.promptContextBuilderService.execute({
      conversationId: request.conversationId,
      message: request.message,
      userId: request.userId,
      memories,
      tokenBudget,
      historyMessages: [],
    });

    /**
     * =========================================================
     * EXECUTE MODEL INFERENCE
     * =========================================================
     */

    const response = await this.aiModelProvider.generateResponse(promptContext);

    /**
     * =========================================================
     * CONSOLIDATE MEMORY
     * =========================================================
     */

    await this.conversationMemoryService.consolidateMemory(request);

    /**
     * =========================================================
     * RETURN RESPONSE
     * =========================================================
     */

    return okResponse(response, 'Generate AI response successfully');
  }
}
