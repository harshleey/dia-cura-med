import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

if (!JWT_ACCESS_SECRET) {
  throw new Error("JWT_ACCESS_SECRET is not defined in environment variables");
}
export function generateAccessToken(user: {
  id: number;
  email: string;
  role: string;
}) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_ACCESS_SECRET,
    { expiresIn: "15min" },
  );
}

if (!JWT_REFRESH_SECRET) throw new Error("JWT_REFRESH_SECRET not defined");
export function generateRefreshToken(user: { id: number; email: string }) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
}

export async function hashToken(token: string) {
  return bcrypt.hash(token, 10);
}

export async function compareToken(token: string, hashed: string) {
  return bcrypt.compare(token, hashed);
}

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, JWT_ACCESS_SECRET);

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, JWT_REFRESH_SECRET);
