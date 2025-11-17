import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { AppointmentService } from "./appointment.service";
import {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
} from "./appointment.validation";
import { ApiResponse } from "../../utils/response.types";
import {
  CreateAppointmentDTO,
  UpdateAppointmentDTO,
} from "./appointment.types";
import { ZodError } from "zod";
import { formatZodError } from "../../utils/format-zod-error";

export const AppointmentController = {
  async createAppointment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data: CreateAppointmentDTO = createAppointmentSchema.parse(
        req.body,
      );
      const appointment = await AppointmentService.createAppointment(
        req.user.id,
        data,
      );
      res
        .status(201)
        .json(ApiResponse.success("Appointment booked", appointment));
    } catch (err: any) {
      if (err instanceof ZodError) {
        return res
          .status(400)
          .json(ApiResponse.error("Validation failed", formatZodError(err)));
      }
      next(err);
    }
  },

  async updateAppointment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data: UpdateAppointmentDTO = updateAppointmentStatusSchema.parse(
        req.body,
      );
      const { appointmentId } = req.params;
      const updatedAppointment =
        await AppointmentService.updateAppointmentStatus(
          appointmentId,
          req.user.id,
          data,
        );
      res
        .status(200)
        .json(ApiResponse.success("Appointment updated", updatedAppointment));
    } catch (err: any) {
      if (err instanceof ZodError) {
        return res
          .status(400)
          .json(ApiResponse.error("Validation failed", formatZodError(err)));
      }
      next(err);
    }
  },

  async getUpcomingAppointments(req: AuthRequest, res: Response) {
    const appointments = await AppointmentService.getUpcomingAppointments(
      req.user.id,
    );
    res.status(200).json(ApiResponse.success("", appointments));
  },

  async getAppointmentHistory(req: AuthRequest, res: Response) {
    const appointments = await AppointmentService.getAppointmentHistory(
      req.user.id,
    );
    res.status(200).json(ApiResponse.success("", appointments));
  },

  async getOneAppointment(req: AuthRequest, res: Response) {
    const { appointmentId } = req.params;
    const appointment = await AppointmentService.getAppointmentById(
      Number(appointmentId),
    );
    res.status(200).json(ApiResponse.success("", appointment));
  },
};
