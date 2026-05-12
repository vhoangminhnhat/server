import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { TokenBudgetStrategyService } from './application/runtime/budget/TokenBudgetStrategy.service';
import { PromptContextBuilderService } from './application/runtime/context/PromptContextBuilder.service';
import { ConversationMemoryService } from './application/runtime/memory/ConversationMemory.service';
import { RetrievalOrchestratorService } from './application/runtime/retrieval/RetrievalOrchestrator.service';
import { GenerateChatResponseUseCase } from './application/useCases/generateChatResponse.useCase';
import { ImportDocumentUseCase } from './application/useCases/importDocument.useCase';
import { AiModelProviderToken } from './domain/token/aiModelProvider.token';
import { DocumentRepositoryToken } from './domain/token/documentRepository.token';
import { EmbeddingProviderToken } from './domain/token/embeddingProvider.token';
import { MemoryRepositoryToken } from './domain/token/memoryRepository.token';
import { RetrievalProviderToken } from './domain/token/RetrievalProvider.token';
import { PrismaDocumentRepository } from './infrastructure/persistence/PrismaDocument.repository';
import { PrismaMemoryRepository } from './infrastructure/persistence/PrismaMemory.repository';
import { OpenAiProvider } from './infrastructure/providers/OpenAi.provider';
import { OpenAiEmbeddingProvider } from './infrastructure/providers/OpenAiEmbedding.provider';
import { HybridVectorRetrievalRepository } from './infrastructure/retrieval/HybridVectorRetrieval.repository';
import { PromptAssemblerService } from './prompts/assembler/PromptAssembler.service';
import { PromptBudgetManagerService } from './prompts/budget/PromptBudgetManager.service';
import { TokenEstimatorService } from './prompts/budget/TokenEstimator.service';
import { ConversationTemplate } from './prompts/templates/Conversation.template';
import { MemoryTemplate } from './prompts/templates/Memory.template';
import { RetrievalTemplate } from './prompts/templates/Retrievial.template';

@Module({
  controllers: [AiController],
  providers: [
    /**
     * =========================================================
     * APPLICATION
     * =========================================================
     */

    GenerateChatResponseUseCase,
    ImportDocumentUseCase,

    /**
     * =========================================================
     * RUNTIME
     * =========================================================
     */

    PromptContextBuilderService,
    TokenBudgetStrategyService,
    ConversationMemoryService,
    RetrievalOrchestratorService,

    /**
     * =========================================================
     * PROMPT RUNTIME
     * =========================================================
     */

    PromptAssemblerService,
    PromptBudgetManagerService,
    TokenEstimatorService,
    ConversationTemplate,
    MemoryTemplate,
    RetrievalTemplate,

    /**
     * =========================================================
     * AI MODEL PROVIDER
     * =========================================================
     */

    {
      provide: AiModelProviderToken.AI_MODEL_PROVIDER,
      useClass: OpenAiProvider,
    },

    {
      provide: EmbeddingProviderToken.EMBEDDING_PROVIDER,
      useClass: OpenAiEmbeddingProvider,
    },

    /**
     * =========================================================
     * MEMORY PERSISTENCE
     * =========================================================
     */

    {
      provide: MemoryRepositoryToken.MEMORY_REPOSITORY,
      useClass: PrismaMemoryRepository,
    },

    {
      provide: DocumentRepositoryToken.DOCUMENT_REPOSITORY,
      useClass: PrismaDocumentRepository,
    },

    /**
     * =========================================================
     * RETRIEVAL PROVIDER
     * =========================================================
     */

    {
      provide: RetrievalProviderToken.RETRIEVAL_PROVIDER,
      useClass: HybridVectorRetrievalRepository,
    },
  ],

  exports: [GenerateChatResponseUseCase],
})
export class AiModule {}
