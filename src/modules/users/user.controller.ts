import { NextFunction, Request, Response } from "express";
import { createUser } from "./user.service";
import { registerSchema } from "../../validations/auth.validation";
import { RegisterDTO, UserResponseDTO } from "./user.types";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";
import { ApiResponse } from "../../utils/response.types";
import { ZodError } from "zod";
import { formatZodError } from "../../utils/format-zod-error";

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterDTO'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponseDTO'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed: RegisterDTO = registerSchema.parse(req.body);

    const user = await createUser(parsed);

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
