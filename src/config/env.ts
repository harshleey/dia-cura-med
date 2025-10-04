import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("8009"),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string(),
});

const env = envSchema.parse(process.env);

export default env;
