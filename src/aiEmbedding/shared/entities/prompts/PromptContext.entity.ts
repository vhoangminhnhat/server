import { RetrievedDocument } from '@/ai/domain/entities/RetrievedDocument.entity';
import { PromptSection } from '@/ai/domain/entities/PromptSections.entity';

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
