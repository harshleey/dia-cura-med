// src/dtos/doctor.dto.ts
import { z } from "zod";
import { updateDoctorSchema } from "./doctor.validation";

export type UpdateDoctorDTO = z.infer<typeof updateDoctorSchema>;

export interface DoctorListResponseDTO {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  countryOfResidence: string | null;
  cityOfResidence: string | null;
  kycStatus: string;
}

export interface DoctorResponseDTO {
  id: number;
  userId: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  countryOfResidence: string | null;
  cityOfResidence: string | null;
  phoneNumber: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  selfieUrl: string | null;
  kycStatus: string;
  createdAt: string;
  updatedAt: string;
}
