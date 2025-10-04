import http from "http";
import dotenv from "dotenv";
import app from "./app"; // <-- import from app.ts

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("📘 Swagger docs available at http://localhost:8009/api-docs");
});
