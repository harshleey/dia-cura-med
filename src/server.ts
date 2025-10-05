import http from "http";
import dotenv from "dotenv";
import app from "./app";
import { emailWorker } from "./queues/workers/email.worker";

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

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
