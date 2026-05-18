import { Module } from '@nestjs/common';
import { GenerateChatResponseUseCase } from './chat/applications/GenerateChat.useCase';
import { PromptContextBuilderService } from './chat/applications/PromptContextBuilder.service';
import { TokenBudgetStrategyService } from './chat/applications/TokenBudgetStrategy.service';
import { AiChatController } from './chat/presentations/AiChat.controller';
import { ImportDocumentUseCase } from './ingestion/applications/ImportDocument.useCase';
import { DocumentIngestionController } from './ingestion/presentations/DocumentIngestion.controller';
import { ConversationMemoryService } from './memory/applications/ConversationMemory.service';
import { PrismaMemoryRepository } from './memory/infrastructures/PrismaMemory.repository';
import { PrismaDocumentRepository } from './persistence/PrismaDocument.repository';
import { PromptAssemblerService } from './promptings/assembler/PromptAssembler.service';
import { PromptBudgetManagerService } from './promptings/budget/PromptBudgetManager.service';
import { TokenEstimatorService } from './promptings/budget/TokenEstimator.service';
import { ConversationTemplate } from './promptings/templates/Conversation.template';
import { MemoryTemplate } from './promptings/templates/Memory.template';
import { RetrievalTemplate } from './promptings/templates/Retrievial.template';
import { OpenAiProvider } from './providers/infrastructures/OpenAi.provider';
import { OpenAiEmbeddingProvider } from './providers/infrastructures/OpenAiEmbedding.provider';
import { RetrievalOrchestratorService } from './retrieval/applications/RetrievalOrchestrator.service';
import { HybridVectorRetrievalRepository } from './retrieval/infrastructures/HybridVectorRetrieval.repository';
import { AiModelProviderToken } from './shared/tokens/aiModelProviders/AiModelProvider.token';
import { EmbeddingProviderToken } from './shared/tokens/aiModelProviders/EmbeddingProvider.token';
import { DocumentRepositoryToken } from './shared/tokens/documents/DocumentRepository.token';
import { MemoryRepositoryToken } from './shared/tokens/memories/MemoryRepository.token';
import { RetrievalRepositoryToken } from './shared/tokens/retrievals/RetrievalRepository.token';

@Module({
  controllers: [AiChatController, DocumentIngestionController],
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
      provide: RetrievalRepositoryToken.RETRIEVAL_PROVIDER,
      useClass: HybridVectorRetrievalRepository,
    },
  ],

  exports: [GenerateChatResponseUseCase],
})
export class AiEmbeddingModule {}
