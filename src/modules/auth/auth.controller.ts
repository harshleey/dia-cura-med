import { NextFunction, Request, Response } from "express";
import {
  ForgotPasswordDTO,
  LoginDTO,
  LoginResponseDTO,
  ResetPasswordDTO,
} from "./auth.types";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from "../../validations/auth.validation";
import { ZodError } from "zod";
import { formatZodError } from "../../utils/format-zod-error";
import { ApiResponse } from "../../utils/response.types";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";
import { AuthService } from "./auth.service";

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed: LoginDTO = loginSchema.parse(req.body);

    const user = await AuthService.authenticateUser(parsed);

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({ userId: user.id });

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
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: formatZodError(err),
      });
    }
    return res
      .status(err.statusCode || 500)
      .json(ApiResponse.error(err.message));
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
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: formatZodError(err),
      });
    }
    return res
      .status(err.statusCode || 500)
      .json(ApiResponse.error(err.message));
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
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: formatZodError(err),
      });
    }
    return res
      .status(err.statusCode || 500)
      .json(ApiResponse.error(err.message));
  }
};
