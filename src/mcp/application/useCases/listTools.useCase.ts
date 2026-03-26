import { Inject, Injectable } from '@nestjs/common';
import { IMcpToolRepository } from '../../domain/repositories/mcpTool.repository.interface';
import { McpToken } from '../../domain/token/mcpTool.repository.token';

@Injectable()
export class ListToolsUseCase {
  constructor(
    @Inject(McpToken.MCP_TOOL_REPOSITORY)
    private readonly mcpToolRepository: IMcpToolRepository,
  ) {}

  execute() {
    return {
      tools: this.mcpToolRepository.listTools(),
    };
  }
}
