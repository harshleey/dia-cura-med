// src/modules/chat/chat.controller.ts
import { Request, Response, NextFunction } from "express";
import { ChatService } from "./chat.service";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { ApiResponse } from "../../utils/response.types";
import { CreateRoomDTO, SendMessageDTO } from "./chat.types";

export class ChatController {
  static async createRoom(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data: CreateRoomDTO = req.body;
      const room = await ChatService.createRoom(data);
      res.status(201).json(ApiResponse.success("Room created", room));
    } catch (err) {
      next(err);
    }
  }

  static async sendMessage(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user.id;
      const roomId = Number(req.params.roomId);
      const data: SendMessageDTO = req.body;
      const message = await ChatService.sendMessage(userId, roomId, data);

      // Emit via Socket.IO
      req.io?.to(`room_${roomId}`).emit("newMessage", message);

      res.status(201).json(ApiResponse.success("Message sent", message));
    } catch (err) {
      next(err);
    }
  }

  static async getUserRooms(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user.id;
      const rooms = await ChatService.getRoomsForUser(userId);
      res.status(200).json(ApiResponse.success("Rooms fetched", rooms));
    } catch (err) {
      next(err);
    }
  }

  static async getRoomMessages(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const roomId = Number(req.params.roomId);
      const messages = await ChatService.getMessages(roomId);
      res.status(200).json(ApiResponse.success("Messages fetched", messages));
    } catch (err) {
      next(err);
    }
  }
}
