// src/modules/chat/chat.service.ts
import { prisma } from "../../config/db";
import { NotFoundError } from "../../exceptions/not-found.exception";
import { NotificationService } from "../notifications/notification.service";
import { CreateRoomDTO, RoomResponse, SendMessageDTO } from "./chat.types";

export class ChatService {
  static async createRoom(data: CreateRoomDTO) {
    // Check if all users exist
    const existingUsers = await prisma.users.findMany({
      where: {
        id: { in: data.participantIds },
      },
      select: { id: true, username: true },
    });

    const existingUserIds = existingUsers.map((user) => user.id);
    const missingUserIds = data.participantIds.filter(
      (id) => !existingUserIds.includes(id),
    );

    if (missingUserIds.length > 0) {
      throw new NotFoundError(`Users not found: ${missingUserIds.join(", ")}`);
    }

    // Check if 1:1 room exists
    if (data.participantIds.length === 2) {
      const existingRoom = await prisma.chatRoom.findFirst({
        where: {
          participants: {
            every: { userId: { in: data.participantIds } },
          },
        },
        include: { participants: true },
      });
      if (existingRoom) return existingRoom;
    }

    const room = await prisma.chatRoom.create({
      data: {
        name: data.name || null,
        participants: {
          create: data.participantIds.map((id) => ({ userId: id })),
        },
      },
      include: { participants: true },
    });

    return room;
  }

  static async sendMessage(
    userId: number,
    roomId: number,
    data: SendMessageDTO,
  ) {
    // Check if user is participant
    const participant = await prisma.chatParticipant.findFirst({
      where: { roomId, userId },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!participant) throw new NotFoundError("User not in this room");

    const message = await prisma.message.create({
      data: { roomId, senderId: userId, content: data.content },
    });

    await NotificationService.createNotification({
      userId: participant.userId,
      title: "New Message",
      message: `You received a new message from ${participant.user.username}`,
      type: "MESSAGE",
    });

    return message;
  }

  static async getRoomsForUser(userId: number): Promise<RoomResponse[]> {
    const rooms = await prisma.chatParticipant.findMany({
      where: { userId },
      include: {
        room: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    username: true,
                  },
                },
              },
            },
            messages: {
              include: {
                sender: {
                  select: {
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return rooms.map((p) => ({
      id: p.room.id,
      name: p.room.name,
      participants: p.room.participants.map((participant) => ({
        id: participant.id,
        userId: participant.userId,
        joinedAt: participant.joinedAt.toISOString(),
        username: participant.user.username,
      })),
      messages: p.room.messages.map((message) => ({
        id: message.id,
        senderId: message.senderId,
        content: message.content,
        read: message.read,
        createdAt: message.createdAt.toISOString(),
        username: message.sender.username,
      })),
      createdAt: p.room.createdAt.toISOString(),
      updatedAt: p.room.updatedAt.toISOString(),
    }));
  }

  static async getMessages(roomId: number) {
    return prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: {
            username: true,
            role: true,
          },
        },
      },
    });
  }
}
