import { Router } from "express";
import { authMiddleWare } from "../../middlewares/auth.middleware";
import {
  authorizeRoles,
  requireApprovedDoctor,
  requireApprovedPatient,
} from "../../middlewares/authorize-roles.middleware";
import { getAllApprovedDoctors, getApprovedDoctor } from "./doctor.controller";

const patientOnly = [authMiddleWare, authorizeRoles("PATIENT")];
const doctorOnly = [authMiddleWare, authorizeRoles("DOCTOR")];

const router = Router();
// DOCTORS
router.get(
  "/",
  authMiddleWare,
  patientOnly,
  requireApprovedPatient,
  getAllApprovedDoctors,
);
router.get(
  "/:id",
  authMiddleWare,
  patientOnly,
  requireApprovedPatient,
  getApprovedDoctor,
);

export default router;
