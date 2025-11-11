import http from "http";
import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import { initSocket } from "./socket";
import { emailWorker } from "./queues/workers/email.worker";

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
export const io = initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("📘 Swagger docs available at http://localhost:8009/api-docs");
});

emailWorker.on("completed", (job) => {
  console.log(`✅ Email job ${job.id} completed`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`❌ Email job ${job?.id} failed:`, err.message);
});
