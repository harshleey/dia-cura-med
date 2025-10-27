import { Router } from "express";
import { authMiddleWare } from "../../middlewares/auth.middleware";
import {
  authorizeRoles,
  requireVerifiedRole,
} from "../../middlewares/authorize-roles.middleware";
import {
  doctorKycConsent,
  doctorKycStep1,
  doctorKycStep2,
  doctorKycStep3,
  patientKycConsent,
  patientKycStep1,
  patientKycStep2,
  patientKycStep3,
  patientKycStep4,
  patientKycStep5,
} from "./kyc.controller";
import { upload } from "../../config/multer";
import { validateKycFiles, validateSelfieFile } from "./doctor-kyc.validation";
upload;
// Create a specific multer config for doctor KYC
const doctorKycUpload = upload.fields([
  { name: "hospitalIdCardUrl", maxCount: 1 },
  { name: "medicalCertificateUrl", maxCount: 1 },
  { name: "nationalIdUrl", maxCount: 1 },
]);

const patientOnly = [authMiddleWare, authorizeRoles("PATIENT")];
const doctorOnly = [authMiddleWare, authorizeRoles("DOCTOR")];

const router = Router();
// PATIENTS
router.post("/patient-kyc/step1", patientOnly, patientKycStep1);
router.post("/patient-kyc/step2", patientOnly, patientKycStep2);
router.post("/patient-kyc/step3", patientOnly, patientKycStep3);
router.post("/patient-kyc/step4", patientOnly, patientKycStep4);
router.post("/patient-kyc/step5", patientOnly, patientKycStep5);
router.post("/patient-kyc/consent", patientOnly, patientKycConsent);

router.post("/doctor-kyc/step1", doctorOnly, doctorKycStep1);
router.post(
  "/doctor-kyc/step2",
  doctorOnly,
  doctorKycUpload,
  validateKycFiles,
  doctorKycStep2,
);
router.post(
  "/doctor-kyc/step3",
  doctorOnly,
  upload.fields([{ name: "selfieUrl", maxCount: 1 }]),
  validateSelfieFile,
  doctorKycStep3,
);
router.post("/doctor-kyc/step4", doctorOnly, doctorKycConsent);

export default router;
