import { z } from "zod";
import { loginSchema } from "../../validations/auth.validation";

export type LoginDTO = z.infer<typeof loginSchema>;

export interface LoginResponseDTO {
  id: string;
  username: string;
  email: string;
  role: string;
  tokens: Tokens;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}
