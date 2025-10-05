import { Redis } from "ioredis";

export const redisConnection = new Redis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  console.log("🔌 Redis client connected");
});

redisConnection.on("ready", () => {
  console.log("✅ Redis is ready to accept commands");
});

redisConnection.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

redisConnection.on("reconnecting", () => {
  console.log("♻️  Redis reconnecting...");
});
