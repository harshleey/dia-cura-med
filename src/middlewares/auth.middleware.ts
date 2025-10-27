import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/response.types";
import { redisConnection } from "../config/redis";

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleWare = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(403).json(ApiResponse.error("No token provided"));
  }

  const token = authHeader.split(" ")[1];
  try {
    if (!process.env.JWT_ACCESS_SECRET) {
      return res
        .status(500)
        .json(ApiResponse.error("JWT secret not configured"));
    }

    // Check blacklist
    const isBlacklisted = await redisConnection.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res
        .status(401)
        .json(ApiResponse.error("Session expired. Please log in again."));
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    req.user = decoded;

    next();
  } catch (err: any) {
    return res.status(401).json("Invalid or expired token");
  }
};
