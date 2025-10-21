import { Router } from "express";
import { authMiddleWare } from "../../middlewares/auth.middleware";
import { requireVerifiedRole } from "../../middlewares/authorize-roles.middleware";
import { deleteProfile, getProfile, updateProfile } from "./profile.controller";

const router = Router();
// PATIENTS
router.get(
  "/",
  authMiddleWare,
  requireVerifiedRole(["DOCTOR", "PATIENT"]),
  getProfile,
);
router.patch(
  "/",
  authMiddleWare,
  requireVerifiedRole(["DOCTOR", "PATIENT"]),
  updateProfile,
);

router.delete(
  "/",
  authMiddleWare,
  requireVerifiedRole(["DOCTOR", "PATIENT"]),
  deleteProfile,
);

export default router;
