export interface IEmbeddingProviderRepository {
  embedText(text: string): Promise<number[]>;
}
