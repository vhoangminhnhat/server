import { IEmbeddingProvider } from '@/ai/domain/interface/embeddingProvider.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OpenAiEmbeddingProvider implements IEmbeddingProvider {
  async embedText(text: string): Promise<number[]> {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      throw new Error(
        'OPENAI_API_KEY is required to generate document embeddings',
      );
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
        input: text,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OpenAI embedding request failed with status ${response.status}`,
      );
    }

    const payload = await response.json();
    const embedding = payload.data?.[0]?.embedding;

    if (!Array.isArray(embedding)) {
      throw new Error('OpenAI embedding response did not include an embedding');
    }

    return embedding.filter((value: unknown): value is number => {
      return typeof value === 'number';
    });
  }

  private getApiKey(): string | undefined {
    return process.env.OPENAI_API_KEY;
  }
}
