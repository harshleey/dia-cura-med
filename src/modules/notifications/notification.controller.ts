import { Request, Response, NextFunction } from "express";
import { NotificationService } from "./notification.service";
import { ApiResponse } from "../../utils/response.types";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const getNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;
    const notifications =
      await NotificationService.getUserNotifications(userId);
    res
      .status(200)
      .json(ApiResponse.success("Notifications fetched", notifications));
  } catch (err) {
    next(err);
  }
};

export const markNotificationAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;
    const notificationId = Number(req.params.id);
    await NotificationService.markAsRead(notificationId, userId);
    res.status(200).json(ApiResponse.success("Notification marked as read"));
  } catch (err) {
    next(err);
  }
};

export const markAllNotificationsAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;
    await NotificationService.markAllAsRead(userId);
    res
      .status(200)
      .json(ApiResponse.success("All notifications marked as read"));
  } catch (err) {
    next(err);
  }
};
