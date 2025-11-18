import { Router } from "express";
import { authMiddleWare } from "../../middlewares/auth.middleware";
import { requireVerifiedRole } from "../../middlewares/authorize-roles.middleware";
import {
  createAvailability,
  deleteAvailability,
  getAllAvailability,
  getAnAvailability,
  updateAvailability,
} from "./availability.controller";

const router = Router();

router.post(
  "/availability",
  authMiddleWare,
  requireVerifiedRole(["DOCTOR"]),
  createAvailability,
);

router.patch(
  "/:id",
  authMiddleWare,
  requireVerifiedRole(["DOCTOR"]),
  updateAvailability,
);

router.delete(
  "/:id",
  authMiddleWare,
  requireVerifiedRole(["DOCTOR"]),
  deleteAvailability,
);

/*
 * ─────────────── DOCTOR + PATIENT ───────────────
 * Patients need these to see available times
 */
router.get(
  "/:doctorId",
  authMiddleWare,
  requireVerifiedRole(["DOCTOR", "PATIENT"]),
  getAllAvailability,
);
router.get(
  "/single/:id",
  authMiddleWare,
  requireVerifiedRole(["DOCTOR", "PATIENT"]),
  getAnAvailability,
);

export default router;
