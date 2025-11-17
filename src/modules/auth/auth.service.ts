import bcrypt from "bcryptjs";
import { prisma } from "../../config/db";
import { BadRequestError } from "../../exceptions/bad-request.exception";
import { ConflictError } from "../../exceptions/conflict.exception";
import { NotFoundError } from "../../exceptions/not-found.exception";
import { emailQueue } from "../../queues/email.queue";
import { comparePassword, hashPassword } from "../../utils/bcrypt";
import { generateOtpToken, verifyOtpToken } from "../../utils/otp-token";
import {
  ChangePasswordDTO,
  ForgotPasswordDTO,
  LoginDTO,
  RefreshTokenDTO,
  RegisterDTO,
  ResetPasswordDTO,
} from "./auth.types";
import {
  compareToken,
  generateAccessToken,
  hashToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import { UnauthorizedError } from "../../exceptions/unauthorized.exception";
import { ForbiddenError } from "../../exceptions/forbidden.exception";
import { Prisma } from "@prisma/client";
import { NotificationService } from "../notifications/notification.service";

export class AuthService {
  static createUser = async (data: RegisterDTO) => {
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

  static authenticateUser = async (data: LoginDTO) => {
    const { email, password } = data;

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (!user.password) {
      throw new BadRequestError("Invalid Credentials");
    }

    const passwordIsMatch = await comparePassword(password, user.password);

    if (!passwordIsMatch) {
      throw new BadRequestError("Invalid Credentials");
    }
    // await NotificationService.createNotification({
    //   userId: user.id,
    //   title: "Logged in",
    //   message: `Hello ${user.username}, your account was just logged into.`,
    //   type: "GENERAL",
    // });
    return user;
  };

  static forgotPassword = async (data: ForgotPasswordDTO) => {
    const { email } = data;

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) throw new NotFoundError("User not found");

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

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const isTokenValid = await verifyOtpToken(resetToken, parsedId);
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

  static changePassword = async (userId: number, data: ChangePasswordDTO) => {
    const { oldPassword, newPassword } = data;

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestError("User not found");

    if (!user.password) {
      throw new BadRequestError("Invalid Credentials");
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new BadRequestError("Old password is incorrect");

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.users.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      // remove all refresh tokens (force re-login everywhere)
      await tx.userSession.deleteMany({ where: { userId: userId } });
    });
  };

  static refreshToken = async (token: string) => {
    if (!token) {
      throw new UnauthorizedError("No refresh token");
    }

    const decoded: any = verifyRefreshToken(token);

    const session = await prisma.userSession.findFirst({
      where: { userId: decoded.id },
    });

    if (!session) {
      throw new ForbiddenError("Invalid refresh token");
    }

    const isValid = compareToken(token, session.token);

    if (!isValid) {
      throw new ForbiddenError("Invalid refresh token");
    }

    const user = await prisma.users.findUnique({ where: { id: decoded.id } });

    if (!user) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    return user;
  };
}
