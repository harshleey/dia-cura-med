import { prisma } from "../../config/db";
import { UserEmailService } from "../../emails/services/user-email.service";
import { ConflictError } from "../../exceptions/conflict.exception";
import { emailQueue } from "../../queues/email.queue";
import { hashPassword } from "../../utils/bcrypt";
import { RegisterDTO } from "./user.types";

export const createUser = async (data: RegisterDTO) => {
  const { username, email, password, role } = data;

  const existing = await prisma.users.findUnique({ where: { email } });

  if (existing) {
    throw new ConflictError("User already exists");
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.users.create({
    data: { username, email, password: hashedPassword, role },
  });

  await emailQueue.add("send-welcome-email", {
    email: user.email,
    username: user.username,
  });

  return user;
};
