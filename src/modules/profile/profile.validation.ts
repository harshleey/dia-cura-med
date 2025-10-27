import { z } from "zod";

export const updateProfileSchema = z.object({
  phoneNumber: z.string().optional(),
  countryOfResidence: z.string().optional(),
  cityOfResidence: z.string().optional(),
  hasAllergies: z.boolean().optional(),
  allergyDetails: z.string().optional(),
});
