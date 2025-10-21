// src/validations/doctor.validation.ts
import { z } from "zod";

export const updateDoctorSchema = z.object({
  countryOfResidence: z.string().optional(),
  cityOfResidence: z.string().optional(),
  phoneNumber: z.string().optional(),
});

export type UpdateDoctorSchema = z.infer<typeof updateDoctorSchema>;
