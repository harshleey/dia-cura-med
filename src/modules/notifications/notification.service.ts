import { prisma } from "../../config/db";
import { CreateNotificationDTO } from "./notification.types";
import { io } from "../../server";

export class NotificationService {
  static async createNotification(data: CreateNotificationDTO) {
    const notification = await prisma.notification.create({ data });

    // Emit real-time notification to the user
    io.to(`user_${data.userId}`).emit("notification", {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    });

    return notification;
  }

  static async getUserNotifications(userId: number) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async markAsRead(notificationId: number, userId: number) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(userId: number) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
