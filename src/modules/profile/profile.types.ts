import { z } from "zod";
import { updateProfileSchema } from "./profile.validation";

// Update DTO
export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;

// Response DTO
export interface ProfileResponseDTO {
  id: number;
  username: string;
  email: string;
  role: string;
  profile: DoctorProfileDTO | PatientProfileDTO | null;
}

export interface DoctorProfileDTO {
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  countryOfResidence: string | null;
  cityOfResidence: string | null;
  hospitalIdCardUrl: string | null;
  medicalCertificateUrl: string | null;
  kycStatus: string;
}

export interface PatientProfileDTO {
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  gender: string | null;
  age: number | null;
  diabetesType: string | null;
  kycStatus: string;
}
