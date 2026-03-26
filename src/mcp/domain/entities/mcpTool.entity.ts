export class McpToolEntity {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly inputSchema: Record<string, unknown>,
  ) {}
}
