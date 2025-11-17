import { z } from "zod";
import {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
} from "./appointment.validation";

export type CreateAppointmentDTO = z.infer<typeof createAppointmentSchema>;

export type UpdateAppointmentDTO = z.infer<
  typeof updateAppointmentStatusSchema
>;
