// src/modules/chat/chat.routes.ts
import { Router } from "express";
import { ChatController } from "./chat.controller";
import { authMiddleWare } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/rooms", authMiddleWare, ChatController.createRoom);
router.get("/rooms", authMiddleWare, ChatController.getUserRooms);
router.get(
  "/rooms/:roomId/messages",
  authMiddleWare,
  ChatController.getRoomMessages,
);
router.post(
  "/rooms/:roomId/messages",
  authMiddleWare,
  ChatController.sendMessage,
);

export default router;
