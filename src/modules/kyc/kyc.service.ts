import { prisma } from "../../config/db";
import { BadRequestError } from "../../exceptions/bad-request.exception";
import { NotFoundError } from "../../exceptions/not-found.exception";
import { Multer } from "multer";
import {
  PatientKycStep1DTO,
  PatientKycStep2DTO,
  PatientKycStep3DTO,
  PatientKycStep4DTO,
  PatientKycStep5DTO,
  PatientKycStep6DTO,
} from "./kyc.types";

import {
  DoctorKycStep1DTO,
  DoctorKycStep2DTO,
  DoctorKycStep3DTO,
  DoctorKycStep4DTO,
  DoctorKycStep5DTO,
} from "./kyc.types";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";

type PatientKycDTO =
  | PatientKycStep1DTO
  | PatientKycStep2DTO
  | PatientKycStep3DTO
  | PatientKycStep4DTO
  | PatientKycStep5DTO;

type DoctorKycDTO =
  | DoctorKycStep1DTO
  | DoctorKycStep2DTO
  | DoctorKycStep3DTO
  | DoctorKycStep4DTO
  | DoctorKycStep5DTO;

export class KycService {
  static updatePatientKycStep = async (
    userId: string,
    stepNumber: Number,
    data: PatientKycDTO,
  ) => {
    const parsedId = Number(userId);
    const parsedStep = Number(stepNumber);

    const user = await prisma.users.findUnique({
      where: { id: parsedId },
    });

    if (!user) throw new NotFoundError("User not found");

    // Convert date only if provided (some steps don't include it)
    const processedData = {
      ...data,
      ...((data as any).dateOfBirth && {
        dateOfBirth: new Date((data as any).dateOfBirth),
      }),
      ...((data as any).diagnosisDate && {
        diagnosisDate: new Date((data as any).diagnosisDate),
      }),
    };

    const patientKyc = await prisma.patientKyc.upsert({
      where: { userId: parsedId },
      update: {
        ...processedData,
        kycStatus: "IN_PROGRESS",
        currentStep: parsedStep,
      },
      create: {
        userId: parsedId,
        ...processedData,
        kycStatus: "IN_PROGRESS",
        currentStep: parsedStep,
      },
    });

    return patientKyc;
  };

  static updatePatientKycAgreement = async (
    userId: string,
    stepNumber: Number,
    data: PatientKycStep6DTO,
    ipAddress: string,
  ) => {
    const parsedId = Number(userId);
    const parsedStep = Number(stepNumber);

    const user = await prisma.users.findUnique({
      where: { id: parsedId },
    });

    if (!user) throw new NotFoundError("User not found");

    const kycAgreement = await prisma.consentAgreement.upsert({
      where: { userId: parsedId },
      update: {
        consentAccepted: true,
        acceptedAt: new Date(),
        agreementVersion: "v1.0",
        ipAddress,
        consentType: "PATIENT_KYC",
      },
      create: {
        userId: parsedId,
        consentAccepted: true,
        acceptedAt: new Date(),
        agreementVersion: "v1.0",
        ipAddress,
        consentType: "PATIENT_KYC",
      },
    });

    await prisma.patientKyc.update({
      where: { userId: parsedId },
      data: {
        kycStatus: "COMPLETED",
        currentStep: parsedStep,
        consentId: kycAgreement.id,
      },
    });

    return kycAgreement;
  };

  static updateDoctorKycStep = async (
    userId: string,
    stepNumber: Number,
    data: DoctorKycDTO,
    files?: Express.Multer.File[],
  ) => {
    const parsedId = Number(userId);
    const parsedStep = Number(stepNumber);

    const user = await prisma.users.findUnique({
      where: { id: parsedId },
    });

    if (!user) throw new NotFoundError("User not found");

    // Convert date only if provided (some steps don't include it)
    const processedData = {
      ...data,
      ...((data as any).dateOfBirth && {
        dateOfBirth: new Date((data as any).dateOfBirth),
      }),
    };

    // Handle uploads depending on step
    if (parsedStep === 2) {
      if (!files || files.length !== 3) {
        throw new Error("Step 2 requires exactly 3 files");
      }

      const [hospitalIdCardUrl, medicalCertificateUrl, nationalIdUrl] =
        await Promise.all(
          files.map((file, index) => {
            // Validate file types if needed
            const allowedMimeTypes = [
              "image/jpeg",
              "image/png",
              "application/pdf",
            ];
            if (!allowedMimeTypes.includes(file.mimetype)) {
              throw new Error(
                `File ${index + 1} has invalid format. Allowed: JPEG, PNG, PDF`,
              );
            }
            return uploadToCloudinary(file, "diacura_doctors/documents");
          }),
        );

      processedData.hospitalIdCardUrl = hospitalIdCardUrl;
      processedData.medicalCertificateUrl = medicalCertificateUrl;
      processedData.nationalIdUrl = nationalIdUrl;
    }

    // Step 3 — Upload Selfie
    if (parsedStep === 3 && files?.[0]) {
      processedData.selfieUrl = await uploadToCloudinary(
        files[0],
        "diacura_doctors/selfies",
      );
    }

    const doctorKyc = await prisma.doctorKyc.upsert({
      where: { userId: parsedId },
      update: {
        ...processedData,
        kycStatus: "IN_PROGRESS",
        currentStep: parsedStep,
        updatedAt: new Date(),
      },
      create: {
        userId: parsedId,
        ...processedData,
        kycStatus: "IN_PROGRESS",
        currentStep: parsedStep,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return doctorKyc;
  };

  static updateDoctorKycAgreement = async (
    userId: string,
    stepNumber: Number,
    data: DoctorKycStep4DTO,
    ipAddress: string,
  ) => {
    const parsedId = Number(userId);
    const parsedStep = Number(stepNumber);

    const user = await prisma.users.findUnique({
      where: { id: parsedId },
    });

    if (!user) throw new NotFoundError("User not found");

    const [kycAgreement, doctorKyc] = await prisma.$transaction(async (tx) => {
      // Step 1: Create or update consent agreement
      const kycAgreement = await tx.consentAgreement.upsert({
        where: { userId: parsedId },
        update: {
          ...data,
          consentAccepted: true,
          acceptedAt: new Date(),
          agreementVersion: "v1.0",
          ipAddress,
          consentType: "DOCTOR_KYC",
        },
        create: {
          userId: parsedId,
          ...data,
          consentAccepted: true,
          acceptedAt: new Date(),
          agreementVersion: "v1.0",
          ipAddress,
          consentType: "DOCTOR_KYC",
        },
      });

      // Step 2: Update Doctor KYC status
      const doctorKyc = await tx.doctorKyc.update({
        where: { userId: parsedId },
        data: {
          kycStatus: "COMPLETED",
          currentStep: parsedStep,
          consentId: kycAgreement.id,
          updatedAt: new Date(),
        },
      });

      return [kycAgreement, doctorKyc];
    });

    return { kycAgreement, doctorKyc };
  };
}
