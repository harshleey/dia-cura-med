import { AppError } from "./base.exception";

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403);
  }
}
