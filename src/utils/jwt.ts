import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = process.env;

export function generateAccessToken(user: {
  id: number;
  email: string;
  role: string;
}): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_ACCESS_SECRET as string,
    { expiresIn: "1h" },
  );
}

export function generateRefreshToken(user: { id: number; email: string }) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_REFRESH_SECRET as string,
    {
      expiresIn: "7d",
    },
  );
}

export async function hashToken(token: string) {
  return bcrypt.hash(token, 10);
}

export async function compareToken(token: string, hashed: string) {
  return bcrypt.compare(token, hashed);
}

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, JWT_ACCESS_SECRET as string);

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, JWT_REFRESH_SECRET as string);
