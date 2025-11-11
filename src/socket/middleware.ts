import { Socket } from "socket.io";
import { verifyAccessToken } from "../utils/jwt"; // your JWT verify function

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: any) => void,
) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("No token provided"));

  try {
    const user = verifyAccessToken(token); // returns decoded user info
    (socket as any).user = user;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
};
