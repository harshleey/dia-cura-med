import { Request, Response, NextFunction } from "express";
import { AppError } from "../exceptions/base.exception";
import { ApiResponse } from "../utils/response.types";

// Import Prisma client to access the namespace
import { PrismaClient } from "@prisma/client";

// Create a type reference to the Prisma namespace
type PrismaKnownRequestError =
  InstanceType<typeof PrismaClient> extends {
    [key: string]: any;
  }
    ? any
    : any;

export const errorHandler = (
  err: Error | any, // Use any as fallback for Prisma errors
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Handle your custom AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(ApiResponse.error(err.message));
  }

  // Handle Prisma Known Errors (e.g., unique constraint)
  // Check if it's a Prisma error by checking for the code property
  if (err.code && typeof err.code === "string" && err.code.startsWith("P")) {
    if (err.code === "P2002") {
      const field = (err.meta?.target as string[])?.join(", ") || "field";
      return res
        .status(409)
        .json(ApiResponse.error(`A user with this ${field} already exists`));
    }

    if (err.code === "P2025") {
      return res.status(404).json(ApiResponse.error("Record not found"));
    }

    if (err.code === "P2003") {
      return res
        .status(400)
        .json(ApiResponse.error("Foreign key constraint failed"));
    }

    // fallback for any other known Prisma error
    return res
      .status(400)
      .json(ApiResponse.error(`Database error: ${err.message}`));
  }

  // ⚠️ Bad Request (400)
  if (
    err.name === "BadRequestError" ||
    err.message.toLowerCase().includes("bad request")
  ) {
    return res.status(400).json(ApiResponse.error("Bad request"));
  }

  // Handle Prisma not found errors
  if (err.name === "NotFoundError" || err.message.includes("not found")) {
    return res.status(404).json(ApiResponse.error("Resource not found"));
  }

  // Handle validation errors (like Zod)
  if (err.name === "ValidationError" || err.name === "ZodError") {
    return res.status(400).json(ApiResponse.error("Validation failed"));
  }

  // 🚫 Unauthorized (401)
  if (
    err.name === "UnauthorizedError" ||
    err.message.toLowerCase().includes("unauthorized")
  ) {
    return res.status(401).json(ApiResponse.error("Unauthorized"));
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json(ApiResponse.error("Invalid token"));
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json(ApiResponse.error("Token expired"));
  }

  // ⛔ Forbidden (403)
  if (
    err.name === "ForbiddenError" ||
    err.message.toLowerCase().includes("forbidden")
  ) {
    return res.status(403).json(ApiResponse.error("Forbidden"));
  }

  // 🔄 Conflict (409)
  if (
    err.name === "ConflictError" ||
    err.message.toLowerCase().includes("conflict") ||
    err.message.toLowerCase().includes("already exists")
  ) {
    return res.status(409).json(ApiResponse.error("Conflict"));
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
