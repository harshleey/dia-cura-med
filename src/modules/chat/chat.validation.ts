import { z } from "zod";

export const createRoomSchema = z.object({
  participantIds: z
    .array(z.number())
    .min(2, "At least 2 participants required"),
  name: z.string().optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
});

export const joinRoomSchema = z.object({
  roomId: z.number(),
});
