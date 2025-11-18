// src/modules/chat/chat.service.ts
import { prisma } from "../../config/db";
import { BadRequestError } from "../../exceptions/bad-request.exception";
import { NotFoundError } from "../../exceptions/not-found.exception";
import { NotificationService } from "../notifications/notification.service";
import { CreateRoomDTO, RoomResponse, SendMessageDTO } from "./chat.types";

export class ChatService {
  static createRoom = async (data: CreateRoomDTO, creatorId: number) => {
    // Ensure only 1:1 chat is allowed (doctor + patient)
    if (data.participantIds.length !== 2) {
      throw new BadRequestError("Only 1:1 chat is allowed");
    }

    const [userA, userB] = data.participantIds;

    // Check if all users exist
    const users = await prisma.users.findMany({
      where: {
        id: { in: data.participantIds },
      },
      select: { id: true, role: true, username: true },
    });

    if (users.length !== 2) {
      throw new NotFoundError("One or more users not found");
    }

    const doctor = users.find((u) => u.role === "DOCTOR");
    const patient = users.find((u) => u.role === "PATIENT");

    if (!doctor || !patient) {
      throw new BadRequestError(
        "Chat allowed only between a doctor and a patient",
      );
    }

    // 🔥 Check if an appointment exists between them
    const appointmentExists = await prisma.appointment.findFirst({
      where: {
        doctorId: doctor.id,
        patientId: patient.id,
      },
    });

    if (!appointmentExists) {
      throw new NotFoundError(
        "No appointment exists between doctor and patient",
      );
    }

    // Prevent non-involved users from creating rooms
    if (!data.participantIds.includes(creatorId)) {
      throw new BadRequestError("You are not allowed to create this room");
    }

    // Check if 1:1 room already exists
    const existingRoom = await prisma.chatRoom.findFirst({
      where: {
        participants: {
          every: { userId: { in: data.participantIds } },
        },
      },
      include: { participants: true },
    });

    if (existingRoom) return existingRoom;

    if (existingRoom) return existingRoom;

    // Create a new chat room
    return prisma.chatRoom.create({
      data: {
        name: data.name || null,
        participants: {
          create: data.participantIds.map((id) => ({ userId: id })),
        },
      },
      include: { participants: true },
    });
  };

  static sendMessage = async (
    userId: number,
    roomId: number,
    data: SendMessageDTO,
  ) => {
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
  };

  static getRoomsForUser = async (userId: number): Promise<RoomResponse[]> => {
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
  };

  static getMessages = async (roomId: number) => {
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
  };
}
