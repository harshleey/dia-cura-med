import { z } from "zod";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  changePasswordSchema,
  registerSchema,
} from "./auth.validation";

export type RegisterDTO = z.infer<typeof registerSchema>;

export type LoginDTO = z.infer<typeof loginSchema>;

export interface LoginResponseDTO {
  id: string;
  username: string;
  email: string;
  role: string;
  tokens: Tokens;
}

export interface UserResponseDTO {
  id: string;
  username: string;
  email: string;
  role: string;
}

export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;

export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;

export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface UserSessionDTO {
  id: string;
}

// Private classes
interface Tokens {
  accessToken: string;
  refreshToken: string;
}
