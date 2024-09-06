export default class WrappedError extends Error {
  private readonly _message: string;
  public readonly message: string;
  public readonly error: Error;

  public constructor(error: Error, message: string) {
    super(message);
    this.error = error;
    this.message = message;
    this._message = message;
  }

  public override toString(): string {
    return `${this._message} ${this.error?.toString()}`;
  }
}