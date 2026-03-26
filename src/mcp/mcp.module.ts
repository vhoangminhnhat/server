import { Module } from '@nestjs/common';
import { ChatModule } from '@/chat/chat.module';
import { CallToolUseCase } from './application/useCases/callTool.useCase';
import { InitializeMcpUseCase } from './application/useCases/initializeMcp.useCase';
import { ListToolsUseCase } from './application/useCases/listTools.useCase';
import { McpDispatcherUseCase } from './application/useCases/mcpDispatcher.useCase';
import { McpToken } from './domain/token/mcpTool.repository.token';
import { ChatToolAdapter } from './infrastructure/adapters/chatTool.adapter';
import { McpToolRegistryRepository } from './infrastructure/repositories/mcpToolRegistry.repository';
import { McpController } from './presentation/mcp.controller';

@Module({
  imports: [ChatModule],
  controllers: [McpController],
  providers: [
    ChatToolAdapter,
    InitializeMcpUseCase,
    ListToolsUseCase,
    CallToolUseCase,
    McpDispatcherUseCase,
    {
      provide: McpToken.MCP_TOOL_REPOSITORY,
      useClass: McpToolRegistryRepository,
    },
  ],
})
export class McpModule {}
