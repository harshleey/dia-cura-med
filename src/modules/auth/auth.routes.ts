import { Router } from "express";
import {
  registerUser,
  changePassword,
  loginUser,
  forgotPassword,
  resetPassword,
  logout,
  refreshToken,
} from "./auth.controller";
import { authMiddleWare } from "../../middlewares/auth.middleware";
import { requireVerifiedRole } from "../../middlewares/authorize-roles.middleware";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:resetToken/:userId", resetPassword);
router.post(
  "/change-password",
  authMiddleWare,
  requireVerifiedRole(["DOCTOR", "PATIENT", "ADMIN"]),
  changePassword,
);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);

export default router;
