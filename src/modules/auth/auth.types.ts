import { z } from "zod";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from "../../validations/auth.validation";

export type LoginDTO = z.infer<typeof loginSchema>;

export interface LoginResponseDTO {
  id: string;
  username: string;
  email: string;
  role: string;
  tokens: Tokens;
}

export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;

export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;

// Private classes
interface Tokens {
  accessToken: string;
  refreshToken: string;
}
