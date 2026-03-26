import { Injectable } from '@nestjs/common';

@Injectable()
export class InitializeMcpUseCase {
  execute() {
    return {
      protocolVersion: '2025-03-26',
      serverInfo: {
        name: 'mcp-client-server',
        version: '1.0.0',
      },
      capabilities: {
        tools: {},
      },
    };
  }
}
