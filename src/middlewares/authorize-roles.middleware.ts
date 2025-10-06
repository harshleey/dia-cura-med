import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/response.types";

// src/middleware/authorizeRoles.js (or .ts)
export const authorizeRoles = (...allowedRoles: any[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.body.user?.role;

    if (!userRole) {
      return res
        .status(401)
        .json(ApiResponse.error("Unauthorized: no role found"));
    }

    if (!allowedRoles.includes(userRole)) {
      return res
        .status(403)
        .json(ApiResponse.error("Access denied: insufficient permissions"));
    }

    next();
  };
};
