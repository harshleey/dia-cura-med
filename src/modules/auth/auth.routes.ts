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
import passport from "../../config/passport";
import { ApiResponse } from "../../utils/response.types";
import { fa } from "zod/v4/locales";

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
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);
// 2️⃣ Google Callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/failure",
  }),
  (req: any, res) => {
    const { user, tokens } = req.user;

    // You can redirect to frontend with tokens, or return JSON
    // Example JSON response:
    return res.status(200).json(
      ApiResponse.success("Google login successful", {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        tokens,
      }),
    );

    // Or redirect (for frontend OAuth):
    // res.redirect(`${process.env.FE_BASE_URL}/auth/success?token=${tokens.accessToken}`);
  },
);

router.get("/auth/failure", (req, res) => {
  res.status(401).json({ success: false, message: "Google login failed" });
});

export default router;
