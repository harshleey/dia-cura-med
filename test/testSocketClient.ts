// testSocketClient.ts
import { io } from "socket.io-client";

const token = "YOUR_ACCESS_TOKEN_HERE"; // replace with a valid JWT

const socket = io("http://localhost:3000", {
  auth: {
    token,
  },
});

socket.on("connect", () => {
  console.log("Connected to server", socket.id);
});

socket.on("notification", (data: any) => {
  console.log("New notification received:", data);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
