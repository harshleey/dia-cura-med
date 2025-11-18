// src/modules/appointment/appointment.routes.ts
import { Router } from "express";
import {
  createAppointment,
  updateAppointment,
  getUpcomingAppointments,
  getAppointmentHistory,
  getOneAppointment,
  completeConsultation,
  startConsultation,
} from "./appointment.controller";
import { authMiddleWare } from "../../middlewares/auth.middleware";
import { requireVerifiedRole } from "../../middlewares/authorize-roles.middleware";

const router = Router();

router.post(
  "/",
  authMiddleWare,
  requireVerifiedRole(["PATIENT"]),
  createAppointment,
);
router.patch(
  "/:appointmentId",
  authMiddleWare,
  requireVerifiedRole(["PATIENT", "DOCTOR"]),
  updateAppointment,
);
router.get(
  "/upcoming",
  authMiddleWare,
  requireVerifiedRole(["PATIENT", "DOCTOR"]),
  getUpcomingAppointments,
);
router.get(
  "/history",
  authMiddleWare,
  requireVerifiedRole(["PATIENT", "DOCTOR"]),
  getAppointmentHistory,
);
router.get(
  "/:appointmentId",
  authMiddleWare,
  requireVerifiedRole(["PATIENT", "DOCTOR"]),
  getOneAppointment,
);

router.patch(
  "/:id/start",
  authMiddleWare,
  requireVerifiedRole(["DOCTOR"]),
  startConsultation,
);

router.patch(
  "/:id/complete",
  authMiddleWare,
  requireVerifiedRole(["DOCTOR"]),
  completeConsultation,
);

export default router;
