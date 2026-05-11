export enum PromptSectionType {
  'SYSTEM' = 'SYSTEM',
  'POLICY' = 'POLICY',
  'MEMORY' = 'MEMORY',
  'RETRIEVAL' = 'RETRIEVAL',
  'CONVERSATION' = 'CONVERSATION',
  'TOOL' = 'TOOL',
}

export class PromptSection {
  type?: PromptSectionType;
  content?: string;
  priority?: number;
  estimatedTokens?: number;
  required?: boolean;

  constructor(data?: Partial<PromptSection>) {
    this.type = data?.type;
    this.content = data?.content;
    this.priority = data?.priority;
    this.estimatedTokens = data?.estimatedTokens;
    this.required = data?.required;
  }
}
