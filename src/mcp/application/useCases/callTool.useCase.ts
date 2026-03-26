import { Inject, Injectable } from '@nestjs/common';
import { IMcpToolRepository } from '../../domain/repositories/mcpTool.repository.interface';
import { McpToken } from '../../domain/token/mcpTool.repository.token';

@Injectable()
export class CallToolUseCase {
  constructor(
    @Inject(McpToken.MCP_TOOL_REPOSITORY)
    private readonly mcpToolRepository: IMcpToolRepository,
  ) {}

  async execute(params: Record<string, unknown>) {
    const toolName = String(params.name || '');
    const args = (params.arguments || {}) as Record<string, unknown>;

    if (!this.mcpToolRepository.hasTool(toolName)) {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    const result = await this.mcpToolRepository.callTool(toolName, args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result),
        },
      ],
    };
  }
}
