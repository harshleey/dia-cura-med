import { Router } from "express";
import { authMiddleWare } from "../../middlewares/auth.middleware";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "./notification.controller";

const router = Router();

router.get("/", authMiddleWare, getNotifications);
router.patch("/:id/read", authMiddleWare, markNotificationAsRead);
router.patch("/read-all", authMiddleWare, markAllNotificationsAsRead);

export default router;
