import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/response.types";
import { AuthRequest } from "./auth.middleware";
import { prisma } from "../config/db";

export const authorizeRoles = (...allowedRoles: any[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user.role;

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

export const requireVerifiedRole = (
  roles: ("DOCTOR" | "PATIENT" | "ADMIN")[],
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || !roles.includes(user.role as any)) {
      return res.status(403).json(ApiResponse.error("Access denied"));
    }

    if (user.role === "DOCTOR") {
      const doctorKyc = await prisma.doctorKyc.findUnique({
        where: { userId: user.id },
        select: { kycStatus: true },
      });
      if (!doctorKyc || doctorKyc.kycStatus !== "PASSED") {
        return res
          .status(403)
          .json(ApiResponse.error("Doctor KYC not approved"));
      }
    }

    if (user.role === "PATIENT") {
      const patientKyc = await prisma.patientKyc.findUnique({
        where: { userId: user.id },
        select: { kycStatus: true },
      });
      if (!patientKyc || patientKyc.kycStatus !== "COMPLETED") {
        return res
          .status(403)
          .json(ApiResponse.error("Patient KYC not completed"));
      }
    }

    next();
  };
};
