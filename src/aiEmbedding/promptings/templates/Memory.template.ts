import { MemoryRecord } from '@/aiEmbedding/memory/domains/entities/MemoryRecord.entity';
import { BasePromptTemplate } from './basePromptTemplate/BasePromptTemplate';

export class MemoryTemplateInput {
  memories!: MemoryRecord[];
}

export class MemoryTemplate extends BasePromptTemplate<MemoryTemplateInput> {
  build(input: MemoryTemplateInput): string {
    if (!input.memories.length) {
      return '';
    }

    const formattedMemories = input.memories.map((memory, index) =>
      [
        `[Memory ${index + 1}]`,
        `Type: ${memory.memoryType}`,
        `Content: ${this.normalize(memory.content)}`,
      ].join('\n'),
    );

    return this.joinSections([
      'Relevant Conversation Memory:',
      ...formattedMemories,
      [
        'Instructions:',
        '- Use memory only when relevant to the current request.',
        '- Do not over-prioritize outdated memory.',
        '- Avoid repeating memory verbatim unless necessary.',
      ].join('\n'),
    ]);
  }
}
