import { Redis } from "ioredis";

const redisUrl = process.env.REDIS_URL;

export const redisConnection = redisUrl
  ? new Redis(redisUrl, { maxRetriesPerRequest: null })
  : new Redis({
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

redisConnection.on("error", (err: any) => {
  console.error("❌ Redis connection error:", err);
});

redisConnection.on("reconnecting", () => {
  console.log("♻️  Redis reconnecting...");
});
