import { Server } from "socket.io";
import { socketAuthMiddleware } from "./middleware";
import { prisma } from "../config/db";

export const initSocket = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // adjust for your frontend domain
      methods: ["GET", "POST"],
    },
  });

  // Apply middleware
  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    const user = (socket as any).user;
    console.log(`User connected: ${user.id}`);

    // Join notification room
    socket.join(`user_${user.id}`);

    // --- CHAT EVENTS ---

    // Join a chat room
    socket.on("joinRoom", async ({ roomId }) => {
      socket.join(`room_${roomId}`);
      console.log(`User ${user.id} joined room ${roomId}`);
    });

    // Send a chat message
    socket.on("sendMessage", async ({ roomId, content }) => {
      // Save to DB
      const message = await prisma.message.create({
        data: {
          roomId,
          senderId: user.id,
          content,
        },
      });

      // Broadcast to all participants in the room
      io.to(`room_${roomId}`).emit("newMessage", message);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${(socket as any).user.id}`);
    });
  });

  return io;
};
