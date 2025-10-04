import { AppError } from "./base.exception";

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}
