import { z } from "zod";
import { updatePatientSchema } from "./patients.validation";

// For update
export type UpdatePatientDTO = z.infer<typeof updatePatientSchema>;

// For list of patients
export interface PatientListResponseDTO {
  id: number;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  gender: string | null;
  age: number | null;
  kycStatus: string;
}

// For getting one patient
export interface PatientResponseDTO {
  id: number;
  userId: number;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  gender: string | null;
  age: number | null;
  dateOfBirth: string | null;
  diabetesType: string | null;
  otherDiabetesType: string | null;
  diagnosisDate: string | null;
  tracksInsulin: boolean | null;
  insulinTherapy: string | null;
  glucoseUnit: string | null;
  measurementSystem: string | null;
  hasAllergies: boolean | null;
  allergyDetails: string | null;
  currentMedications: string[];
  kycStatus: string;
  createdAt: string;
  updatedAt: string;
}
