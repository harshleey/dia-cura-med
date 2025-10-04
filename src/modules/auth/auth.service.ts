import { prisma } from "../../config/db";
import { BadRequestError } from "../../exceptions/bad-request.exception";
import { ConflictError } from "../../exceptions/conflict.exception";
import { NotFoundError } from "../../exceptions/not-found.exception";
import { comparePassword, hashPassword } from "../../utils/bcrypt";
import { LoginDTO } from "./auth.types";

export const authenticateUser = async (data: LoginDTO) => {
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
