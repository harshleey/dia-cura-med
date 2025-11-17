import { z } from "zod";
import {
  createRoomSchema,
  sendMessageSchema,
  joinRoomSchema,
} from "./chat.validation";

export type CreateRoomDTO = z.infer<typeof createRoomSchema>;
export type SendMessageDTO = z.infer<typeof sendMessageSchema>;
export type JoinRoomDTO = z.infer<typeof joinRoomSchema>;

// Response DTOs
export interface UserResponse {
  username: string;
}

export interface ParticipantResponse {
  id: number;
  userId: number;
  joinedAt: string;
  username: string;
}

export interface MessageResponse {
  id: number;
  senderId: number;
  content: string;
  read: boolean;
  username: string;
  createdAt: string;
}

export interface RoomResponse {
  id: number;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  participants: ParticipantResponse[];
  messages: MessageResponse[];
}
