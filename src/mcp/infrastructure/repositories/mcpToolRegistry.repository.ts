import { Injectable } from '@nestjs/common';
import { McpToolEntity } from '../../domain/entities/mcpTool.entity';
import { IMcpToolRepository } from '../../domain/repositories/mcpTool.repository.interface';
import { ChatToolAdapter } from '../adapters/chatTool.adapter';

@Injectable()
export class McpToolRegistryRepository implements IMcpToolRepository {
  constructor(private readonly chatToolAdapter: ChatToolAdapter) {}

  private readonly tools: McpToolEntity[] = [
    new McpToolEntity(
      'chat.get_messages',
      'Get chat messages from a conversation.',
      {
        type: 'object',
        properties: {
          conversationId: { type: 'string' },
          limit: { type: 'number' },
        },
      },
    ),
    new McpToolEntity(
      'chat.send_message',
      'Send a message into a conversation.',
      {
        type: 'object',
        properties: {
          conversationId: { type: 'string' },
          senderId: { type: 'string' },
          senderName: { type: 'string' },
          content: { type: 'string' },
        },
        required: ['content'],
      },
    ),
  ];

  listTools(): McpToolEntity[] {
    return this.tools;
  }

  hasTool(name: string): boolean {
    return this.tools.some((tool) => tool.name === name);
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    if (name === 'chat.get_messages') {
      return this.chatToolAdapter.getMessages(args);
    }

    if (name === 'chat.send_message') {
      return this.chatToolAdapter.sendMessage(args);
    }

    throw new Error(`Unknown tool: ${name}`);
  }
}
