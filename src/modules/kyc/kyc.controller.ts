import { Request, Response, NextFunction } from "express";
import {
  patientKycStep1Schema,
  patientKycStep2Schema,
  patientKycStep3Schema,
  patientKycStep4Schema,
  patientKycStep5Schema,
  patientKycStep6Schema,
} from "./patient-kyc.validation";
import {
  DoctorKycStep1DTO,
  DoctorKycStep2DTO,
  DoctorKycStep4DTO,
  PatientKycStep1DTO,
  PatientKycStep2DTO,
  PatientKycStep3DTO,
  PatientKycStep4DTO,
  PatientKycStep5DTO,
  PatientKycStep6DTO,
} from "./kyc.types";
import { KycService } from "./kyc.service";
import { ApiResponse } from "../../utils/response.types";
import { ZodError } from "zod";
import { formatZodError } from "../../utils/format-zod-error";
import {
  doctorKycStep1Schema,
  doctorKycStep2Schema,
  doctorKycStep4Schema,
} from "./doctor-kyc.validation";
import multer from "multer";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const patientKycStep1 = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;
    const parsed: PatientKycStep1DTO = patientKycStep1Schema.parse(req.body);

    const savedPatient = await KycService.updatePatientKycStep(userId, 1, {
      ...parsed,
      dateOfBirth: parsed.dateOfBirth,
    });

    res.status(200).json(
      ApiResponse.success("Data saved successfully", {
        nextStep: 2,
        data: savedPatient,
      }),
    );
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json(ApiResponse.error("Validation failed", formatZodError(err)));
    }
    next(err);
  }
};

export const patientKycStep2 = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;
    const parsed: PatientKycStep2DTO = patientKycStep2Schema.parse(req.body);

    const savedPatient = await KycService.updatePatientKycStep(userId, 2, {
      ...parsed,
    });

    res.status(200).json(
      ApiResponse.success("Data saved successfully", {
        nextStep: 3,
        data: savedPatient,
      }),
    );
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json(ApiResponse.error("Validation failed", formatZodError(err)));
    }
    next(err);
  }
};

export const patientKycStep3 = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;
    const parsed: PatientKycStep3DTO = patientKycStep3Schema.parse(req.body);

    const savedPatient = await KycService.updatePatientKycStep(userId, 3, {
      ...parsed,
    });

    res.status(200).json(
      ApiResponse.success("Data saved successfully", {
        nextStep: 4,
        data: savedPatient,
      }),
    );
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json(ApiResponse.error("Validation failed", formatZodError(err)));
    }
    next(err);
  }
};

export const patientKycStep4 = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;
    const parsed: PatientKycStep4DTO = patientKycStep4Schema.parse(req.body);

    const savedPatient = await KycService.updatePatientKycStep(userId, 4, {
      ...parsed,
    });

    res.status(200).json(
      ApiResponse.success("Data saved successfully", {
        nextStep: 5,
        data: savedPatient,
      }),
    );
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json(ApiResponse.error("Validation failed", formatZodError(err)));
    }
    next(err);
  }
};

export const patientKycStep5 = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;
    const parsed: PatientKycStep5DTO = patientKycStep5Schema.parse(req.body);

    const savedPatient = await KycService.updatePatientKycStep(userId, 5, {
      ...parsed,
    });

    res.status(200).json(
      ApiResponse.success("Data saved successfully", {
        nextStep: 6,
        data: savedPatient,
      }),
    );
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json(ApiResponse.error("Validation failed", formatZodError(err)));
    }
    next(err);
  }
};

export const patientKycConsent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;
    const parsed: PatientKycStep6DTO = patientKycStep6Schema.parse(req.body);
    const ipAddress: string =
      req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown";

    const agreement = await KycService.updatePatientKycAgreement(
      userId,
      6,
      { ...parsed },
      ipAddress,
    );

    res.status(200).json(
      ApiResponse.success("Data saved successfully", {
        nextStep: 6,
        data: agreement,
      }),
    );
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json(ApiResponse.error("Validation failed", formatZodError(err)));
    }
    next(err);
  }
};

export const doctorKycStep1 = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const parsed: DoctorKycStep1DTO = doctorKycStep1Schema.parse(req.body);

    // ✅ Ensure email matches the one used to sign up
    if (parsed.email.toLowerCase() !== userEmail.toLowerCase()) {
      return res
        .status(400)
        .json(ApiResponse.error("Email does not match your account email"));
    }

    const savedDoctor = await KycService.updateDoctorKycStep(userId, 1, {
      ...parsed,
      dateOfBirth: parsed.dateOfBirth,
    });

    res.status(200).json(
      ApiResponse.success("Data saved successfully", {
        nextStep: 2,
        data: savedDoctor,
      }),
    );
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json(ApiResponse.error("Validation failed", formatZodError(err)));
    }
    next(err);
  }
};

export const doctorKycStep2 = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;
    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;
    const data = req.body;
    // ✅ Validate presence of all three files
    if (
      !files ||
      !files.hospitalIdCardUrl ||
      !files.medicalCertificateUrl ||
      !files.nationalIdUrl
    ) {
      return res
        .status(400)
        .json(
          ApiResponse.error(
            "All three files are required: proof of hospital ID, medical certificate, and national ID",
          ),
        );
    }

    // ✅ Flatten the files into a single array for upload logic
    const fileArray = [
      ...files.hospitalIdCardUrl,
      ...files.medicalCertificateUrl,
      ...files.nationalIdUrl,
    ];

    const savedDoctor = await KycService.updateDoctorKycStep(
      userId,
      2,
      data,
      fileArray,
    );

    res.status(200).json(
      ApiResponse.success("Data saved successfully", {
        nextStep: 3,
        data: savedDoctor,
      }),
    );
  } catch (err: any) {
    // Handle validation errors
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json(ApiResponse.error("Validation failed", formatZodError(err)));
    }
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json(
            ApiResponse.error("File too large. Maximum size is 5MB per file."),
          );
      }
      if (err.code === "LIMIT_FILE_COUNT") {
        return res
          .status(400)
          .json(ApiResponse.error("Too many files. Maximum 3 files allowed."));
      }
    }
    // Let global error middleware handle known/unknown errors
    next(err);
  }
};

export const doctorKycStep3 = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const data = req.body;

    if (!files || !files.selfieUrl || files.selfieUrl.length === 0) {
      return res
        .status(400)
        .json(ApiResponse.error("A selfie file is required."));
    }

    const selfieFile = files.selfieUrl[0];

    const savedDoctor = await KycService.updateDoctorKycStep(
      userId,
      3, // step number
      data,
      [selfieFile],
    );

    res.status(200).json(
      ApiResponse.success("Selfie uploaded successfully", {
        nextStep: 4,
        data: savedDoctor,
      }),
    );
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json(ApiResponse.error("Validation failed", formatZodError(err)));
    }

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json(ApiResponse.error("File too large. Maximum size is 5MB."));
      }
    }

    next(err);
  }
};

export const doctorKycConsent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;
    const parsed: DoctorKycStep4DTO = doctorKycStep4Schema.parse(req.body);
    const ipAddress: string =
      req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown";

    const agreement = await KycService.updateDoctorKycAgreement(
      userId,
      4,
      { ...parsed },
      ipAddress,
    );

    res.status(200).json(
      ApiResponse.success("Data saved successfully", {
        nextStep: 5,
        data: agreement,
      }),
    );
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json(ApiResponse.error("Validation failed", formatZodError(err)));
    }
    next(err);
  }
};
