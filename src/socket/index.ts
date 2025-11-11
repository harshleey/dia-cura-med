import { Server } from "socket.io";
import { socketAuthMiddleware } from "./middleware";

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
    console.log(`User connected: ${(socket as any).user.id}`);
    socket.join(`user_${(socket as any).user.id}`);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${(socket as any).user.id}`);
    });
  });

  return io;
};
