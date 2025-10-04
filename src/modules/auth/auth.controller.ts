import { NextFunction, Request, Response } from "express";
import { LoginDTO, LoginResponseDTO } from "./auth.types";
import { loginSchema } from "../../validations/auth.validation";
import { authenticateUser } from "./auth.service";
import { ZodError } from "zod";
import { formatZodError } from "../../utils/format-zod-error";
import { ApiResponse } from "../../utils/response.types";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed: LoginDTO = loginSchema.parse(req.body);

    const user = await authenticateUser(parsed);

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
