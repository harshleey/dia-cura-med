import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { ProfileService } from "./profile.service";
import { ApiResponse } from "../../utils/response.types";
import { updateProfileSchema } from "./profile.validation";

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;
    const user = await ProfileService.getProfile(userId);
    res.status(200).json(ApiResponse.success("Profile fetched", user.profile));
  } catch (err: any) {
    next(err);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;
    const validated = updateProfileSchema.parse(req.body);
    const user = await ProfileService.updateProfile(userId, validated);
    res.status(200).json(ApiResponse.success("Profile updated", user.profile));
  } catch (err: any) {
    next(err);
  }
};

export const deleteProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;
    await ProfileService.deleteProfile(userId);
    res.status(200).json(ApiResponse.success("Profile deleted successfully"));
  } catch (err: any) {
    next(err);
  }
};
