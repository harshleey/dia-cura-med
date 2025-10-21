import { Router } from "express";
import { authMiddleWare } from "../../middlewares/auth.middleware";
import {
  authorizeRoles,
  requireVerifiedRole,
} from "../../middlewares/authorize-roles.middleware";
import { getAllApprovedDoctors, getApprovedDoctor } from "./doctor.controller";

const router = Router();
// DOCTORS
router.get(
  "/",
  authMiddleWare,
  requireVerifiedRole(["PATIENT"]),
  getAllApprovedDoctors,
);
router.get(
  "/:id",
  authMiddleWare,
  requireVerifiedRole(["PATIENT"]),
  getApprovedDoctor,
);

export default router;
