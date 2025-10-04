import { AppError } from "./base.exception";

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}
