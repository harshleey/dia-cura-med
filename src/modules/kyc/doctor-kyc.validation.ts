import { NextFunction, Response, Request } from "express";
import { z } from "zod";
import { ApiResponse } from "../../utils/response.types";
import { AuthRequest } from "../../middlewares/auth.middleware";

// STEP 1 — Personal Details
export const doctorKycStep1Schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email required"),
  countryOfResidence: z.string().min(1, "Country of residence is required"),
  cityOfResidence: z.string().min(1, "City of residence is required"),
  phoneNumber: z.string().min(7, "Phone number is required"),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  gender: z.enum(["Male", "Female", "Other"]),
  specialization: z.string().min(3, "Specialization is required"),
});

// STEP 2 — Proof of Identity (All 3 Required)
export const doctorKycStep2Schema = z.object({
  hospitalIdCardUrl: z.string().url("Hospital ID card is required"),
  medicalCertificateUrl: z.string().url("Medical certificate is required"),
  nationalIdUrl: z.string().url("National ID is required"),
});

// STEP 3 — Selfie Upload
export const doctorKycStep3Schema = z.object({
  selfieUrl: z.string().url("Selfie is required"),
});

// STEP 4 — Consent & Agreement
export const doctorKycStep4Schema = z.object({
  consentAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept consent & agreement",
  }),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  hodFirstName: z.string().min(1, "HOD first name is required"),
  hodLastName: z.string().min(1, "HOD last name is required"),
  hodEmail: z.string().email("HOD email is required"),
  hodPhone: z.string().min(7, "HOD phone number is required"),
});

// STEP 5 — Assessment Email Sent (handled automatically)
export const doctorKycStep5Schema = z.object({
  assessmentSent: z.boolean().optional(),
});

// STEP 6 — Assessment Upload
export const doctorKycStep6Schema = z.object({
  assessmentUploadUrl: z.string().url("Assessment result upload required"),
  assessmentScore: z
    .number()
    .min(0)
    .max(100)
    .refine((val) => val >= 0 && val <= 100, {
      message: "Score must be between 0 and 100",
    }),
});

export const validateKycFiles = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  if (!files) {
    return res.status(400).json(ApiResponse.error("Files are required"));
  }

  const requiredFiles = [
    "hospitalIdCardUrl",
    "medicalCertificateUrl",
    "nationalIdUrl",
  ];
  const missingFiles = requiredFiles.filter(
    (field) => !files[field] || files[field].length === 0,
  );

  if (missingFiles.length > 0) {
    return res
      .status(400)
      .json(
        ApiResponse.error(`Missing required files: ${missingFiles.join(", ")}`),
      );
  }

  next();
};

export const validateSelfieFile = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  if (!files || !files.selfieUrl || files.selfieUrl.length === 0) {
    return res
      .status(400)
      .json(ApiResponse.error("A selfie file is required for step 3."));
  }

  const selfie = files.selfieUrl[0];
  const allowedMimeTypes = ["image/jpeg", "image/png"];

  if (!allowedMimeTypes.includes(selfie.mimetype)) {
    return res
      .status(400)
      .json(ApiResponse.error("Invalid file type. Only JPEG or PNG allowed."));
  }

  // Optional: limit selfie size (e.g., 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (selfie.size > maxSize) {
    return res
      .status(400)
      .json(ApiResponse.error("File too large. Maximum size is 5MB."));
  }

  next();
};
