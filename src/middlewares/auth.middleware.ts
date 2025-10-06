import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/response.types";

export const authMiddleWare = (
  req: Request,
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

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    console.log(decoded);
    req.body.user = decoded;
    next();
  } catch (err: any) {
    return res.status(401).json("Invalid or expired token");
  }
};
