import { z } from "zod";

export const timeRangeSchema = z.object({
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export const createAvailabilitySchema = z.object({
  date: z.string(), // YYYY-MM-DD
  times: z.array(timeRangeSchema).min(1),
});

export const updateAvailabilitySchema = z.object({
  date: z.string().optional(),
  times: z.array(timeRangeSchema).optional(),
});
