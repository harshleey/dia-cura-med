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

export const requireApprovedDoctor = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;

    if (!user || user.role !== "DOCTOR") {
      return res
        .status(403)
        .json(ApiResponse.error("Access restricted to doctors only"));
    }

    const doctorKyc = await prisma.doctorKyc.findUnique({
      where: { userId: user.id },
      select: { kycStatus: true },
    });

    if (!doctorKyc) {
      return res
        .status(403)
        .json(ApiResponse.error("Doctor KYC record not found"));
    }

    if (doctorKyc.kycStatus !== "PASSED") {
      return res
        .status(403)
        .json(ApiResponse.error("Access denied: KYC not approved"));
    }

    next();
  } catch (error) {
    console.error("requireApprovedDoctor error:", error);
    return res
      .status(500)
      .json(ApiResponse.error("Internal server error checking doctor KYC"));
  }
};

export const requireApprovedPatient = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;

    if (!user || user.role !== "PATIENT") {
      return res.status(403).json(ApiResponse.error("Access denied"));
    }

    const patientKyc = await prisma.patientKyc.findUnique({
      where: { userId: user.id },
      select: { kycStatus: true },
    });

    if (!patientKyc) {
      return res.status(403).json(ApiResponse.error("Record not found"));
    }

    if (patientKyc.kycStatus !== "COMPLETED") {
      return res
        .status(403)
        .json(ApiResponse.error("Access denied: KYC not completed"));
    }

    next();
  } catch (error) {
    next(error);
  }
};
