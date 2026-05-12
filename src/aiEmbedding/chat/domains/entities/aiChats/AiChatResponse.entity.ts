export class AiChatResponse {
  constructor(
    public readonly content: string,
    public readonly model: string,
    public readonly usage?: {
      inputTokens?: number;
      outputTokens?: number;
      totalTokens?: number;
    },
    public readonly memoriesApplied: string[] = [],
    public readonly retrievedDocuments: string[] = [],
  ) {}
}
