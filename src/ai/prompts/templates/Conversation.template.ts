import { BasePromptTemplate } from './basePromptTemplate/BasePromptTemplate';

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
}

export class ConversationTemplateInput {
  messages!: ConversationMessage[];
}

export class ConversationTemplate extends BasePromptTemplate<ConversationTemplateInput> {
  build(input: ConversationTemplateInput): string {
    if (!input.messages.length) {
      return '';
    }

    const formattedMessages = input.messages.map((message) =>
      [`[${message.role.toUpperCase()}]`, this.normalize(message.content)].join(
        '\n',
      ),
    );

    return this.joinSections([
      'Conversation History:',
      ...formattedMessages,
      [
        'Instructions:',
        '- Maintain conversational continuity.',
        '- Preserve relevant context from previous interactions.',
        '- Avoid repeating previous answers unnecessarily.',
      ].join('\n'),
    ]);
  }
}
