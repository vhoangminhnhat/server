import { MemoryRecord } from '@/aiEmbedding/memory/domains/entities/MemoryRecord.entity';
import { PromptAssemblerService } from '@/aiEmbedding/promptings/assembler/PromptAssembler.service';
import { PromptBudgetManagerService } from '@/aiEmbedding/promptings/budget/PromptBudgetManager.service';
import {
  ConversationMessage,
  ConversationTemplate,
} from '@/aiEmbedding/promptings/templates/Conversation.template';
import { MemoryTemplate } from '@/aiEmbedding/promptings/templates/Memory.template';
import { RetrievalTemplate } from '@/aiEmbedding/promptings/templates/Retrievial.template';
import { IRetrievalRepository } from '@/aiEmbedding/retrieval/domains/repositories/RetrievalRepository.interface';
import { PromptContext } from '@/aiEmbedding/shared/entities/prompts/PromptContext.entity';
import {
  PromptSection,
  PromptSectionType,
} from '@/aiEmbedding/shared/entities/prompts/PromptSections.entity';
import { TokenBudget } from '@/aiEmbedding/shared/entities/tokenBudget/TokenBudget.entity';
import { RetrievalRepositoryToken } from '@/aiEmbedding/shared/tokens/retrievals/RetrievalRepository.token';
import { Inject, Injectable } from '@nestjs/common';

interface BuildPromptContextInput {
  conversationId: string;
  message: string;
  userId?: string;
  memories: MemoryRecord[];
  tokenBudget: TokenBudget;
  historyMessages?: ConversationMessage[];
}

@Injectable()
export class PromptContextBuilderService {
  constructor(
    @Inject(RetrievalRepositoryToken.RETRIEVAL_PROVIDER)
    private readonly retrievalRepository: IRetrievalRepository,
    private readonly retrievalTemplate: RetrievalTemplate,
    private readonly memoryTemplate: MemoryTemplate,
    private readonly conversationTemplate: ConversationTemplate,
    private readonly promptAssembler: PromptAssemblerService,
    private readonly promptBudgetManager: PromptBudgetManagerService,
  ) {}

  async execute(input: BuildPromptContextInput): Promise<PromptContext> {
    /**
     * =========================================================
     * RETRIEVE CONTEXT DOCUMENTS
     * =========================================================
     */

    const retrievedDocuments =
      await this.retrievalRepository.searchRelevantDocuments(input.message, 4);

    /**
     * =========================================================
     * INITIAL PROMPT SECTIONS
     * =========================================================
     */

    const sections: PromptSection[] = [];

    /**
     * =========================================================
     * SYSTEM SECTION
     * =========================================================
     */

    sections.push(
      new PromptSection({
        type: PromptSectionType.SYSTEM,
        priority: 100,
        required: true,
        content: `
You are an AI assistant integrated into an institutional platform.

Your primary responsibility is to help users understand:
- institutional regulations
- academic policies
- official announcements
- administrative procedures
- compliance-related documents

Prioritize:
- accuracy
- grounded responses
- retrieval-based reasoning
- clarity

Avoid inventing regulations, legal clauses, institutional rules, or unsupported facts.
        `.trim(),
      }),
    );

    /**
     * =========================================================
     * POLICY SECTION
     * =========================================================
     */

    sections.push(
      new PromptSection({
        type: PromptSectionType.POLICY,
        priority: 95,
        required: true,
        content:
          `Always distinguish retrieved evidence from general model knowledge. When retrieved information is incomplete:
             - Explicitly communicate uncertainty
             - Avoid fabricating missing details
          Use retrieved institutional content as the primary source of truth whenever available.
          Respond in the same language as the user's latest message unless the user explicitly asks for another language.
          For Vietnamese legal or institutional documents, preserve official Vietnamese terms and quote article/clause names exactly when available in retrieved context.
        `.trim(),
      }),
    );

    /**
     * =========================================================
     * RETRIEVAL SECTION
     * =========================================================
     */

    const retrievalContent = this.retrievalTemplate.build({
      documents: retrievedDocuments,
    });

    if (retrievalContent) {
      sections.push(
        new PromptSection({
          type: PromptSectionType.RETRIEVAL,
          priority: 90,
          required: false,
          content: retrievalContent,
        }),
      );
    }

    /**
     * =========================================================
     * MEMORY SECTION
     * =========================================================
     */

    const memoryContent = this.memoryTemplate.build({
      memories: input.memories,
    });

    if (memoryContent) {
      sections.push(
        new PromptSection({
          type: PromptSectionType.MEMORY,
          priority: 70,
          required: false,
          content: memoryContent,
        }),
      );
    }

    /**
     * =========================================================
     * CONVERSATION SECTION
     * =========================================================
     */

    const conversationContent = this.conversationTemplate.build({
      messages: input.historyMessages || [],
    });

    if (conversationContent) {
      sections.push(
        new PromptSection({
          type: PromptSectionType.CONVERSATION,
          priority: 60,
          required: false,
          content: conversationContent,
        }),
      );
    }

    /**
     * =========================================================
     * USER SECTION
     * =========================================================
     */

    sections.push(
      new PromptSection({
        type: PromptSectionType.SYSTEM,
        priority: 100,
        required: true,
        content: ` Current User Request: ${input.message.trim()}`.trim(),
      }),
    );

    /**
     * =========================================================
     * TOKEN BUDGET ALLOCATION
     * =========================================================
     */

    const allocatedSections = this.promptBudgetManager.allocate(
      sections,
      input.tokenBudget,
    );

    /**
     * =========================================================
     * FINAL PROMPT ASSEMBLY
     * =========================================================
     */

    const assemblyResult = this.promptAssembler.assemble(allocatedSections);

    /**
     * =========================================================
     * RETURN FINAL PROMPT CONTEXT
     * =========================================================
     */

    return new PromptContext({
      conversationId: input.conversationId,
      userMessage: input.message,
      prompt: assemblyResult.prompt,
      sections: assemblyResult.sections,
      estimatedTokens: assemblyResult.estimatedTokens,
      userId: input.userId,
      retrievedDocuments,
    });
  }
}
