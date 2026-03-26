import { McpToolEntity } from '../entities/mcpTool.entity';

export interface IMcpToolRepository {
  listTools(): McpToolEntity[];
  callTool(name: string, args: Record<string, unknown>): Promise<unknown>;
  hasTool(name: string): boolean;
}
