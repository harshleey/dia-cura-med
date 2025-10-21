import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { PatientService } from "./patient.service";
import { ApiResponse } from "../../utils/response.types";
import { updatePatientSchema } from "../../validations/patients.validation";

export const getAllPatients = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const patients = await PatientService.getAllPatients();
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

export const updatePatient = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;
    const parsed = updatePatientSchema.parse(req.body);

    const updatedPatient = await PatientService.updatePatient(userId, parsed);
    res
      .status(200)
      .json(ApiResponse.success("Patient updated", updatedPatient));
  } catch (err: any) {
    next(err);
  }
};

export const deletePatient = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const updatedPatient = await PatientService.deletePatient(userId);
    res.status(200).json(ApiResponse.success("Deleted"));
  } catch (err: any) {
    next(err);
  }
};
