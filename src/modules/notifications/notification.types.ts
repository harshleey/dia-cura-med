import { z } from "zod";
import {
  createNotificationSchema,
  updateNotificationSchema,
} from "./notification.validation";

export type CreateNotificationDTO = z.infer<typeof createNotificationSchema>;

export type UpdateNotificationDTO = z.infer<typeof updateNotificationSchema>;

export interface NotificationResponseDTO {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}
