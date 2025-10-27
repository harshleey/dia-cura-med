import { z } from "zod";

import {
  patientKycStep1Schema,
  patientKycStep2Schema,
  patientKycStep3Schema,
  patientKycStep4Schema,
  patientKycStep5Schema,
  patientKycStep6Schema,
} from "./patient-kyc.validation";
import {
  doctorKycStep1Schema,
  doctorKycStep2Schema,
  doctorKycStep3Schema,
  doctorKycStep4Schema,
  doctorKycStep5Schema,
  doctorKycStep6Schema,
} from "./doctor-kyc.validation";

// PATIENTS

// Step 1
export type PatientKycStep1DTO = z.infer<typeof patientKycStep1Schema>;

// Step 2
export type PatientKycStep2DTO = z.infer<typeof patientKycStep2Schema>;

// Step 3
export type PatientKycStep3DTO = z.infer<typeof patientKycStep3Schema>;

// Step 4
export type PatientKycStep4DTO = z.infer<typeof patientKycStep4Schema>;

// Step 5
export type PatientKycStep5DTO = z.infer<typeof patientKycStep5Schema>;

// Step 6
export type PatientKycStep6DTO = z.infer<typeof patientKycStep6Schema>;

// DOCTORS
export type DoctorKycStep1DTO = z.infer<typeof doctorKycStep1Schema>;

export type DoctorKycStep2DTO = z.infer<typeof doctorKycStep2Schema>;

export type DoctorKycStep3DTO = z.infer<typeof doctorKycStep3Schema>;

export type DoctorKycStep4DTO = z.infer<typeof doctorKycStep4Schema>;

export type DoctorKycStep5DTO = z.infer<typeof doctorKycStep5Schema>;

export type DoctorKycStep6DTO = z.infer<typeof doctorKycStep6Schema>;
