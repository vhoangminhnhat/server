export class AiChatRequest {
  constructor(
    public readonly conversationId: string,
    public readonly message: string,
    public readonly userId?: string,
    public readonly metadata?: Record<string, unknown>,
  ) {}
}
