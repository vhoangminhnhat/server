import { RetrievedDocument } from '@/aiEmbedding/retrieval/domains/entities/RetrievedDocument.entity';
import { PromptSection } from '@/aiEmbedding/shared/entities/prompts/PromptSections.entity';

export class PromptContext {
  readonly conversationId?: string;
  readonly userMessage?: string;
  readonly prompt?: string;
  readonly sections?: PromptSection[];
  readonly estimatedTokens?: number;
  readonly userId?: string;
  readonly retrievedDocuments?: RetrievedDocument[];

  constructor(data?: Partial<PromptContext>) {
    Object.assign(this, data);
  }
}
