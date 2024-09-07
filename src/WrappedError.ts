export default class WrappedError extends Error {
  public readonly message: string;
  public readonly error: Error;

  public constructor(error: Error, message: string) {
    super(message);
    this.error = error;
    this.message = message;
    console.debug(`WrappedError: ${this.toString()}`);
  }

  public override toString(): string {
    return `${this.message} ${this.error?.toString()} ${this.error?.stack}`;
  }
}