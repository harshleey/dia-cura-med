import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { ApiResponse } from "../../utils/response.types";
import { DoctorService } from "./doctor.service";

export const getAllApprovedDoctors = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const doctors = await DoctorService.getAllApprovedDoctors();

    console.log(doctors);
    res.status(200).json(ApiResponse.success("Doctors fetched", doctors));
  } catch (err: any) {
    next(err);
  }
};

export const getApprovedDoctor = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const doctorId = parseInt(req.params.id);
    const doctor = await DoctorService.getApprovedDoctorById(doctorId);
    res.status(200).json(ApiResponse.success("Doctor fetched", doctor));
  } catch (err: any) {
    next(err);
  }
};
