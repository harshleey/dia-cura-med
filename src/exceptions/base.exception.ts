export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;

    // Capture stack trace (optional but helpful for debugging)
    Error.captureStackTrace(this, this.constructor);
  }
}
