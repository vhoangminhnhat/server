import { Injectable } from '@nestjs/common';
import { McpRequestEntity } from '../../domain/entities/mcpRequest.entity';
import { McpResponseEntity } from '../../domain/entities/mcpResponse.entity';
import { McpRequestValidatorService } from '../../domain/services/mcpRequestValidator.service';
import { CallToolUseCase } from './callTool.useCase';
import { InitializeMcpUseCase } from './initializeMcp.useCase';
import { ListToolsUseCase } from './listTools.useCase';

@Injectable()
export class McpDispatcherUseCase {
  constructor(
    private readonly initializeMcpUseCase: InitializeMcpUseCase,
    private readonly listToolsUseCase: ListToolsUseCase,
    private readonly callToolUseCase: CallToolUseCase,
  ) {}

  async execute(request: McpRequestEntity): Promise<McpResponseEntity> {
    const { id, method, params } = McpRequestValidatorService.normalize(request);

    try {
      if (method === 'initialize') {
        return McpResponseEntity.ok(id, this.initializeMcpUseCase.execute());
      }

      if (method === 'tools/list') {
        return McpResponseEntity.ok(id, this.listToolsUseCase.execute());
      }

      if (method === 'tools/call') {
        return McpResponseEntity.ok(id, await this.callToolUseCase.execute(params));
      }

      return McpResponseEntity.fail(id, -32601, `Method not found: ${method}`);
    } catch (error) {
      const message = (error as Error)?.message || 'Internal MCP error';
      if (message.includes('Unknown tool:')) {
        return McpResponseEntity.fail(id, -32602, message);
      }
      return McpResponseEntity.fail(id, -32000, message);
    }
  }
}
