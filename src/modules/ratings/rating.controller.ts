import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { ApiResponse } from "../../utils/response.types";
import { RatingService } from "./rating.service";
import { CreateRatingDTO } from "./rating.types";
import { CreateRatingSchema } from "./rating.validation";
import { ZodError } from "zod";
import { formatZodError } from "../../utils/format-zod-error";

export const rateDoctor = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const patientId = req.user.id;
    const data: CreateRatingDTO = CreateRatingSchema.parse(req.body);
    const rating = await RatingService.rateDoctor(Number(patientId), req.body);
    res.status(201).json(ApiResponse.success("Rating created", rating));
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json(ApiResponse.error("Validation failed", formatZodError(err)));
    }
    next(err);
  }
};

export const getDoctorRatings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user.id;
  //   const doctorId = Number(req.params.doctorId);

  const ratings = await RatingService.getDoctorRatings(userId);
  res.status(200).json(ApiResponse.success("Ratings fetched", ratings));
};

export const getRating = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user.id;
  const ratingId = Number(req.params.ratingId);

  const rating = await RatingService.getRatingById(userId, ratingId);

  res.status(200).json(ApiResponse.success("Rating fetched", rating));
};
