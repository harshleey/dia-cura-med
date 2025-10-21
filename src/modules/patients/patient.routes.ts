import { Router } from "express";
import { authMiddleWare } from "../../middlewares/auth.middleware";
import {
  authorizeRoles,
  requireApprovedDoctor,
  requireApprovedPatient,
} from "../../middlewares/authorize-roles.middleware";
import {
  deletePatient,
  getAllPatients,
  getPatient,
  updatePatient,
} from "./patient.controller";

const patientOnly = [authMiddleWare, authorizeRoles("PATIENT")];
const doctorOnly = [authMiddleWare, authorizeRoles("DOCTOR")];

const router = Router();
// PATIENTS
router.get(
  "/",
  authMiddleWare,
  doctorOnly,
  requireApprovedDoctor,
  getAllPatients,
);
router.get(
  "/:id",
  authMiddleWare,
  doctorOnly,
  requireApprovedDoctor,
  getPatient,
);
router.patch(
  "/",
  authMiddleWare,
  patientOnly,
  requireApprovedPatient,
  updatePatient,
);

router.delete("/", authMiddleWare, patientOnly, deletePatient);

export default router;
