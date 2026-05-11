export class AiDocument {
  id?: string;
  title?: string;
  source?: string;
  content?: string;
  userId?: string;
  createdAt?: Date;

  constructor(data?: Partial<AiDocument>) {
    Object.assign(this, data);
  }
}
