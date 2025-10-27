import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  ChangePasswordDTO,
  ForgotPasswordDTO,
  LoginDTO,
  LoginResponseDTO,
  RegisterDTO,
  ResetPasswordDTO,
  UserResponseDTO,
} from "./auth.types";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "./auth.validation";
import { ZodError } from "zod";
import { formatZodError } from "../../utils/format-zod-error";
import { ApiResponse } from "../../utils/response.types";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import { AuthService } from "./auth.service";
import { prisma } from "../../config/db";
import { UnauthorizedError } from "../../exceptions/unauthorized.exception";
import { NotFoundError } from "../../exceptions/not-found.exception";
import { redisConnection } from "../../config/redis";

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed: RegisterDTO = registerSchema.parse(req.body);

    const user = await AuthService.createUser(parsed);

    const userResponse: UserResponseDTO = {
      id: user.id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    };

    res
      .status(201)
      .json(ApiResponse.success("User created successfully", userResponse));
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json(ApiResponse.error("Validation failed", formatZodError(err)));
    }
    next(err);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed: LoginDTO = loginSchema.parse(req.body);

    const user = await AuthService.authenticateUser(parsed);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const hashedRefresh = await hashToken(refreshToken);

    await prisma.userSession.create({
      data: {
        userId: user.id,
        token: hashedRefresh,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/auth/refresh-token",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const loginResponse: LoginResponseDTO = {
      id: user.id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      tokens: {
        accessToken,
        refreshToken,
      },
    };

    res
      .status(200)
      .json(ApiResponse.success("Login Successful", loginResponse));
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json(ApiResponse.error("Validation failed", formatZodError(err)));
    }
    next(err);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed: ForgotPasswordDTO = forgotPasswordSchema.parse(req.body);

    await AuthService.forgotPassword(parsed);

    return res.status(200).json(ApiResponse.success("Token sent to email"));
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json(ApiResponse.error("Validation failed", formatZodError(err)));
    }
    next(err);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed: ResetPasswordDTO = resetPasswordSchema.parse(req.body);
    const { resetToken, userId } = req.params;

    await AuthService.resetPassword(resetToken, userId, parsed);

    return res
      .status(200)
      .json(ApiResponse.success("Password reset successful"));
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json(ApiResponse.error("Validation failed", formatZodError(err)));
    }
    next(err);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed: ChangePasswordDTO = changePasswordSchema.parse(req.body);

    await AuthService.changePassword(req.body.user.id, parsed);

    res.status(200).json(ApiResponse.success("Password updated successfully"));
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json(ApiResponse.error("Validation failed", formatZodError(err)));
    }
    next(err);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const refreshToken = req.cookies.refreshToken;
  const authHeader = req.headers.authorization;

  if (!refreshToken) {
    throw new UnauthorizedError("No refresh token");
  }
  try {
    const decoded: any = verifyRefreshToken(refreshToken);

    // Delete all user sessions
    await prisma.userSession.deleteMany({
      where: { userId: decoded.id },
    });

    if (authHeader?.startsWith("Bearer ")) {
      const accessToken = authHeader.split(" ")[1];
      const decodedAccess: any = jwt.decode(accessToken);
      const expiresAt = decodedAccess?.exp;

      if (expiresAt) {
        const ttl = expiresAt - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await redisConnection.setex(
            `blacklist:${accessToken}`,
            ttl,
            "revoked",
          );
        }
      }
    }

    res.clearCookie("refreshToken", { path: "/auth/refresh-token" });

    res.status(200).json(ApiResponse.success("Logged out successfully"));
  } catch (error) {
    res.status(400).json(ApiResponse.error("Invalid token"));
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const refreshToken = req.cookies.refreshToken;

  try {
    const refreshTokenUser = await AuthService.refreshToken(refreshToken);
    const newAccessToken = generateAccessToken(refreshTokenUser);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
};
