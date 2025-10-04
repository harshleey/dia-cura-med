import { AppError } from "./base.exception";

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}
