export class McpResponseEntity {
  constructor(
    public readonly jsonrpc: '2.0',
    public readonly id: string | number | null,
    public readonly result?: Record<string, unknown>,
    public readonly error?: {
      code: number;
      message: string;
    },
  ) {}

  static ok(
    id: string | number | null,
    result: Record<string, unknown>,
  ): McpResponseEntity {
    return new McpResponseEntity('2.0', id, result);
  }

  static fail(
    id: string | number | null,
    code: number,
    message: string,
  ): McpResponseEntity {
    return new McpResponseEntity('2.0', id, undefined, {
      code,
      message,
    });
  }
}
