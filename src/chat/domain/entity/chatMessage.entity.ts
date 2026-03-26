export class ChatMessage {
  constructor(
    public readonly id: string,
    public readonly conversationId: string,
    public readonly senderId: string,
    public readonly senderName: string,
    public readonly content: string,
    public readonly createdAt: Date,
  ) {}
}
