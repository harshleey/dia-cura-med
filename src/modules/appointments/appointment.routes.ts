// src/modules/appointment/appointment.routes.ts
import { Router } from "express";
import { AppointmentController } from "./appointment.controller";
import { authMiddleWare } from "../../middlewares/auth.middleware";
import { requireVerifiedRole } from "../../middlewares/authorize-roles.middleware";

const router = Router();

router.post(
  "/",
  authMiddleWare,
  requireVerifiedRole(["PATIENT"]),
  AppointmentController.createAppointment,
);
router.patch(
  "/:appointmentId",
  authMiddleWare,
  requireVerifiedRole(["PATIENT", "DOCTOR"]),
  AppointmentController.updateAppointment,
);
router.get(
  "/upcoming",
  authMiddleWare,
  requireVerifiedRole(["PATIENT", "DOCTOR"]),
  AppointmentController.getUpcomingAppointments,
);
router.get(
  "/history",
  authMiddleWare,
  requireVerifiedRole(["PATIENT", "DOCTOR"]),
  AppointmentController.getAppointmentHistory,
);
router.get(
  "/:appointmentId",
  authMiddleWare,
  requireVerifiedRole(["PATIENT", "DOCTOR"]),
  AppointmentController.getOneAppointment,
);

export default router;
