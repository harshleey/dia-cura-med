import { z } from "zod";

export const CreateRatingSchema = z.object({
  doctorId: z.number("Doctor ID is required"),
  appointmentId: z.number("Appointment ID is required"),

  rating: z
    .number("Rating is required")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5")
    .int("Rating must be a whole number"),

  comment: z
    .string()
    .max(500, "Comment must be less than 500 characters")
    .optional(),
});
