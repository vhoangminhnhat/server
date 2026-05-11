export class TokenBudget {
  maxInputTokens?: number;
  reservedOutputTokens?: number;
  maxHistoryTokens?: number;
  maxMemoryTokens?: number;
  maxRetrievalTokens?: number;

  constructor(data?: Partial<TokenBudget>) {
    this.maxInputTokens = data?.maxInputTokens;
    this.reservedOutputTokens = data?.reservedOutputTokens;
    this.maxHistoryTokens = data?.maxHistoryTokens;
    this.maxMemoryTokens = data?.maxMemoryTokens;
    this.maxRetrievalTokens = data?.maxRetrievalTokens;
  }
}
