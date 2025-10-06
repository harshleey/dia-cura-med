import { AppError } from "./base.exception";

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401);
  }
}
