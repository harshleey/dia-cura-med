import { Router } from "express";
import { authMiddleWare } from "../../middlewares/auth.middleware";
import {
  authorizeRoles,
  requireVerifiedRole,
} from "../../middlewares/authorize-roles.middleware";
import { getAllPatients, getPatient } from "./patient.controller";

const patientOnly = [authMiddleWare, authorizeRoles("PATIENT")];
const doctorOnly = [authMiddleWare, authorizeRoles("DOCTOR")];

const router = Router();
// PATIENTS
router.get(
  "/",
  authMiddleWare,
  requireVerifiedRole(["DOCTOR"]),
  getAllPatients,
);
router.get("/:id", authMiddleWare, requireVerifiedRole(["DOCTOR"]), getPatient);

export default router;
