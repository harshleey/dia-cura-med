import { z } from "zod";
import {
  createAvailabilitySchema,
  updateAvailabilitySchema,
} from "./availability.validation";

export type CreateAvailabilityDTO = z.infer<typeof createAvailabilitySchema>;

export type UpdateAvailabilityDTO = z.infer<typeof updateAvailabilitySchema>;

export interface AvailabilityResponseDto {
  id: string;
  doctorId: string;
  date: string;
  times: {
    id: number;
    startTime: string;
    endTime: string;
  }[];
  createdAt: Date;
}
