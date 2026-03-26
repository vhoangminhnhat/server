import { Body, Controller, Post } from '@nestjs/common';
import { McpRequestEntity } from '../domain/entities/mcpRequest.entity';
import { McpDispatcherUseCase } from '../application/useCases/mcpDispatcher.useCase';

@Controller('mcp')
export class McpController {
  constructor(private readonly mcpDispatcherUseCase: McpDispatcherUseCase) {}

  @Post()
  async handleRequest(@Body() request: McpRequestEntity) {
    return this.mcpDispatcherUseCase.execute(request);
  }
}
