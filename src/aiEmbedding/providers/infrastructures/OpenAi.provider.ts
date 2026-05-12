import { AiChatResponse } from '@/aiEmbedding/chat/domains/entities/aiChats/AiChatResponse.entity';
import { PromptContext } from '@/aiEmbedding/chat/domains/entities/promptContexts/PromptContext.entity';
import { IAiModelProviderRepository } from '@/aiEmbedding/chat/domains/repositories/AiModelProviderRepository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OpenAiProvider implements IAiModelProviderRepository {
  async generateResponse(context: PromptContext): Promise<AiChatResponse> {
    const apiKey = this.getApiKey();
    const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

    if (apiKey) {
      return this.generateWithOpenAi(context, apiKey, model);
    }

    return this.generateGroundedFallback(context);
  }

  private async generateWithOpenAi(
    context: PromptContext,
    apiKey: string,
    model: string,
  ): Promise<AiChatResponse> {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: context.prompt,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      return this.generateGroundedFallback(context);
    }

    const payload = await response.json();
    const content =
      payload.output_text ||
      payload.output
        ?.flatMap((item: any) => item.content || [])
        ?.map((item: any) => item.text || '')
        ?.filter(Boolean)
        ?.join('\n')
        ?.trim() ||
      '';

    return new AiChatResponse(
      content || this.buildInsufficientContextAnswer(),
      model,
      {
        inputTokens: context.estimatedTokens,
        outputTokens: payload.usage?.output_tokens,
        totalTokens: payload.usage?.total_tokens,
      },
      [],
      this.getRetrievedDocumentIds(context),
    );
  }

  private generateGroundedFallback(context: PromptContext): AiChatResponse {
    const documents = context.retrievedDocuments || [];

    if (!documents.length) {
      return new AiChatResponse(
        this.buildInsufficientContextAnswer(),
        'local-grounded-fallback',
        {
          inputTokens: context.estimatedTokens,
          outputTokens: 0,
          totalTokens: context.estimatedTokens,
        },
        [],
        [],
      );
    }

    const evidence = documents
      .slice(0, 3)
      .map((document, index) => {
        const source = document.source ? ` - ${document.source}` : '';
        const excerpt = this.truncate(document.content || '', 700);

        return `[${index + 1}] ${document.title || 'Untitled'}${source}\n${excerpt}`;
      })
      .join('\n\n');

    return new AiChatResponse(
      [
        'Mình tìm thấy các đoạn nội bộ có liên quan dưới đây. Chưa có OPENAI_API_KEY nên mình chưa suy luận/generate đầy đủ, nhưng đây là căn cứ tốt nhất hiện có:',
        '',
        evidence,
        '',
        'Gợi ý tiếp theo: cấu hình OPENAI_API_KEY để AI tổng hợp, đối chiếu và trả lời tự nhiên hơn dựa trên các đoạn này.',
      ].join('\n'),
      'local-grounded-fallback',
      {
        inputTokens: context.estimatedTokens,
        outputTokens: 0,
        totalTokens: context.estimatedTokens,
      },
      [],
      this.getRetrievedDocumentIds(context),
    );
  }

  private buildInsufficientContextAnswer(): string {
    return 'Mình chưa tìm thấy nội dung nội bộ đủ liên quan để trả lời chắc chắn. Bạn có thể import thêm văn bản hoặc hỏi cụ thể hơn về điều/khoản/nội dung cần đối chiếu.';
  }

  private getApiKey(): string | undefined {
    return process.env.OPENAI_API_KEY;
  }

  private getRetrievedDocumentIds(context: PromptContext): string[] {
    return (context.retrievedDocuments || [])
      .map((document) => document.id)
      .filter(Boolean) as string[];
  }

  private truncate(content: string, maxLength: number): string {
    if (content.length <= maxLength) {
      return content;
    }

    return `${content.slice(0, maxLength).trim()}...`;
  }
}
