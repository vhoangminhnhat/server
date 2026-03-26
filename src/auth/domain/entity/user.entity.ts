export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly role: string,
  ) {}

  validatePassword(plain: string, compareFn: (a: string, b: string) => Promise<boolean>) {
    return compareFn(plain, this.passwordHash);
  }
}