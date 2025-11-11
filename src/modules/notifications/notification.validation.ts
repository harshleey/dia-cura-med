import { title } from "process";
import { z } from "zod";

export const createNotificationSchema = z.object({
  userId: z.number("User ID is required"),
  title: z.string().min(3).max(50, "Title is required"),
  message: z.string().min(3).min(50, "Message is required"),
  type: z.enum([
    "KYC_STATUS",
    "MESSAGE",
    "APPOINTMENT",
    "SYSTEM_ALERT",
    "REMINDER",
    "GENERAL",
  ]),
  isRead: z.boolean().optional(),
});

export const updateNotificationSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  message: z.string().min(3).max(500).optional(),
  type: z
    .enum(["KYC_STATUS", "MESSAGE", "APPOINTMENT", "SYSTEM_ALERT", "REMINDER"])
    .optional(),
  isRead: z.boolean().optional(),
});
