import { RetrievedDocument } from '@/ai/domain/entities/RetrievedDocument.entity';
import { BasePromptTemplate } from './basePromptTemplate/BasePromptTemplate';

export class RetrievalTemplateInput {
  documents!: RetrievedDocument[];
}

export class RetrievalTemplate extends BasePromptTemplate<RetrievalTemplateInput> {
  build(input: RetrievalTemplateInput): string {
    if (!input.documents.length) {
      return '';
    }

    const formattedDocuments = input.documents.map((document, index) =>
      [
        `[Retrieved Document ${index + 1}]`,
        document.title ? `Title: ${this.normalize(document.title)}` : null,
        document.source ? `Source: ${this.normalize(document.source)}` : null,
        document.relevanceScore !== undefined
          ? `Relevance Score: ${document.relevanceScore}`
          : null,
        '',
        this.normalize(document.content || ''),
      ]
        .filter(Boolean)
        .join('\n'),
    );

    return this.joinSections([
      'Retrieved Context:',
      ...formattedDocuments,
      [
        'Instructions:',
        '- Use retrieved context as the primary source of truth.',
        '- Do not contradict retrieved information.',
        '- If retrieved context is insufficient, explicitly mention uncertainty.',
      ].join('\n'),
    ]);
  }
}
