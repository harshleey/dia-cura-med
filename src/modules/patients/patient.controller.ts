import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { PatientService } from "./patient.service";
import { ApiResponse } from "../../utils/response.types";

export const getAllPatients = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { search } = req.query;
    const patients = await PatientService.getAllPatients(search as string);
    res.status(200).json(ApiResponse.success("Patients fetched", patients));
  } catch (err: any) {
    next(err);
  }
};

export const getPatient = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const patientId = parseInt(req.params.id);
    const patient = await PatientService.getAPatientById(patientId);
    res.status(200).json(ApiResponse.success("Patient fetched", patient));
  } catch (err: any) {
    next(err);
  }
};
