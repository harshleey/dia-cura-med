import bcrypt from "bcryptjs";
import { prisma } from "../../config/db";
import { BadRequestError } from "../../exceptions/bad-request.exception";
import { ConflictError } from "../../exceptions/conflict.exception";
import { NotFoundError } from "../../exceptions/not-found.exception";
import { emailQueue } from "../../queues/email.queue";
import { comparePassword, hashPassword } from "../../utils/bcrypt";
import { generateOtpToken, verifyOtpToken } from "../../utils/otp-token";
import { ForgotPasswordDTO, LoginDTO, ResetPasswordDTO } from "./auth.types";

export class AuthService {
  static authenticateUser = async (data: LoginDTO) => {
    const { email, password } = data;

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const passwordIsMatch = await comparePassword(password, user.password);

    if (!passwordIsMatch) {
      throw new BadRequestError("Invalid Password");
    }

    return user;
  };

  static forgotPassword = async (data: ForgotPasswordDTO) => {
    const { email } = data;

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) return;

    await prisma.otpToken.deleteMany({
      where: { userId: user.id },
    });

    const { generatedOtpToken, hashedOtpToken } = await generateOtpToken();

    await prisma.otpToken.create({
      data: {
        userId: user.id,
        token: hashedOtpToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 15),
      },
    });

    await emailQueue.add("send-password-reset", {
      email: user.email,
      username: user.username,
      token: generatedOtpToken,
      user,
    });
  };

  static resetPassword = async (
    resetToken: string,
    userId: string,
    data: ResetPasswordDTO,
  ) => {
    const parsedId = Number(userId);
    if (isNaN(parsedId)) throw new BadRequestError("Invalid user ID");

    const { newPassword } = data;
    const user = await prisma.users.findUnique({
      where: { id: parsedId },
    });

    if (!user) throw new NotFoundError("User not found");

    await prisma.$transaction(async (tx) => {
      const isTokenValid = await verifyOtpToken(resetToken, userId);
      if (!isTokenValid) throw new BadRequestError("Invalid or expired token");

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await tx.users.update({
        where: { id: parsedId },
        data: { password: hashedPassword },
      });

      await tx.otpToken.deleteMany({ where: { userId: parsedId } });
    });

    await emailQueue.add("send-password-reset-success", {
      email: user.email,
      username: user.username,
    });
  };
}
