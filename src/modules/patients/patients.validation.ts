import { z } from "zod";

/**
 * Validation Schemas
 */

// Schema for updating patient details (only by the patient)
export const updatePatientSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  diabetesType: z.string().optional(),
  otherDiabetesType: z.string().optional(),
  diagnosisDate: z.string().optional(),
  tracksInsulin: z.boolean().optional(),
  insulinTherapy: z.string().optional(),
  glucoseUnit: z.string().optional(),
  measurementSystem: z.string().optional(),
  hasAllergies: z.boolean().optional(),
  allergyDetails: z.string().optional(),
  currentMedications: z.array(z.string()).optional(),
});
