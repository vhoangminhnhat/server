export interface IEmbeddingProvider {
  embedText(text: string): Promise<number[]>;
}
