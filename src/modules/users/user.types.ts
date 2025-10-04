import { z } from "zod";
import { registerSchema } from "../../validations/auth.validation";

export type RegisterDTO = z.infer<typeof registerSchema>;

export interface UserResponseDTO {
  id: string;
  username: string;
  email: string;
  role: string;
}
