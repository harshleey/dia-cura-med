import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { createAvailabilitySchema } from "./availability.validation";
import { AvailabilityService } from "./availability.service";
import { ZodError } from "zod";
import { formatZodError } from "../../utils/format-zod-error";
import { ApiResponse } from "../../utils/response.types";
import { CreateAvailabilityDTO } from "./availability.types";

export const createAvailability = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data: CreateAvailabilityDTO = createAvailabilitySchema.parse(
      req.body,
    );
    const doctorId = req.user.id;

    const availability = await AvailabilityService.createAvailability(
      doctorId,
      data,
    );
    res
      .status(201)
      .json(ApiResponse.success("Availability created", availability));
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json(ApiResponse.error("Validation failed", formatZodError(err)));
    }
    next(err);
  }
};

export const updateAvailability = async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const doctorId = req.user.id;
  const data = req.body;

  const updated = await AvailabilityService.updateAvailability(
    id,
    doctorId,
    data,
  );
  res.status(200).json(ApiResponse.success("Availability updated", updated));
};

export const getAllAvailability = async (req: AuthRequest, res: Response) => {
  const doctorId = Number(req.params.doctorId);
  const availability = await AvailabilityService.getAllAvailability(doctorId);

  res
    .status(200)
    .json(ApiResponse.success("Availability fetched", availability));
};

export const getAnAvailability = async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const availability = await AvailabilityService.getAvailability(id);
  res
    .status(200)
    .json(ApiResponse.success("Availability fetched", availability));
};

export const deleteAvailability = async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const doctorId = req.user.id;

  const result = await AvailabilityService.deleteAvailability(id, doctorId);
  res.status(404).json(ApiResponse.success("Availability deleted"));
};
