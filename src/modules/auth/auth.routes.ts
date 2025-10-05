import { Router } from "express";
import { loginUser, forgotPassword, resetPassword } from "./auth.controller";

const router = Router();

router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:resetToken/:userId", resetPassword);

export default router;
