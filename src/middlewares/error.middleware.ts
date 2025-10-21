import { Request, Response, NextFunction } from "express";
import { AppError } from "../exceptions/base.exception";
import { ApiResponse } from "../utils/response.types";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Error caught by global handler:", err);

  // Handle your custom AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(ApiResponse.error(err.message));
  }

  // Handle Prisma not found errors
  if (err.name === "NotFoundError" || err.message.includes("not found")) {
    return res.status(404).json(ApiResponse.error("Resource not found"));
  }

  // Handle validation errors (like Zod)
  if (err.name === "ValidationError" || err.name === "ZodError") {
    return res.status(400).json(ApiResponse.error("Validation failed"));
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json(ApiResponse.error("Invalid token"));
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json(ApiResponse.error("Token expired"));
  }

  // Default to 500 server error
  return res
    .status(500)
    .json(
      ApiResponse.error(
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
      ),
    );
};
