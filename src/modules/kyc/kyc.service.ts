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
import { emailQueue } from "../../queues/email.queue";
import { Prisma } from "@prisma/client";

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
    userId: number,
    stepNumber: number,
    data: PatientKycDTO,
  ) => {
    const user = await prisma.users.findUnique({
      where: { id: userId },
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
      where: { userId },
      update: {
        ...processedData,
        kycStatus: "IN_PROGRESS",
        currentStep: stepNumber,
      },
      create: {
        userId,
        ...processedData,
        kycStatus: "IN_PROGRESS",
        currentStep: stepNumber,
      },
    });

    return patientKyc;
  };

  static updatePatientKycAgreement = async (
    userId: number,
    stepNumber: number,
    data: PatientKycStep6DTO,
    ipAddress: string,
  ) => {
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundError("User not found");

    const kycAgreement = await prisma.consentAgreement.upsert({
      where: { userId },
      update: {
        consentAccepted: true,
        acceptedAt: new Date(),
        agreementVersion: "v1.0",
        ipAddress,
        consentType: "PATIENT_KYC",
      },
      create: {
        userId,
        consentAccepted: true,
        acceptedAt: new Date(),
        agreementVersion: "v1.0",
        ipAddress,
        consentType: "PATIENT_KYC",
      },
    });

    await prisma.patientKyc.update({
      where: { userId },
      data: {
        kycStatus: "COMPLETED",
        currentStep: stepNumber,
        consentId: kycAgreement.id,
      },
    });

    await emailQueue.add("patient-kyc-completed", {
      email: user.email,
      username: user.username,
    });

    return kycAgreement;
  };

  static updateDoctorKycStep = async (
    userId: number,
    stepNumber: number,
    data: DoctorKycDTO,
    files?: Express.Multer.File[],
  ) => {
    const user = await prisma.users.findUnique({
      where: { id: userId },
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
    if (stepNumber === 2) {
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
    if (stepNumber === 3 && files?.[0]) {
      processedData.selfieUrl = await uploadToCloudinary(
        files[0],
        "diacura_doctors/selfies",
      );
    }

    const doctorKyc = await prisma.doctorKyc.upsert({
      where: { userId },
      update: {
        ...processedData,
        kycStatus: "IN_PROGRESS",
        currentStep: stepNumber,
        updatedAt: new Date(),
      },
      create: {
        userId,
        ...processedData,
        kycStatus: "IN_PROGRESS",
        currentStep: stepNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return doctorKyc;
  };

  static updateDoctorKycAgreement = async (
    userId: number,
    stepNumber: number,
    data: DoctorKycStep4DTO,
    ipAddress: string,
  ) => {
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundError("User not found");

    const [kycAgreement, doctorKyc] = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // Step 1: Create or update consent agreement
        const kycAgreement = await tx.consentAgreement.upsert({
          where: { userId },
          update: {
            ...data,
            consentAccepted: true,
            acceptedAt: new Date(),
            agreementVersion: "v1.0",
            ipAddress,
            consentType: "DOCTOR_KYC",
          },
          create: {
            userId,
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
          where: { userId },
          data: {
            kycStatus: "COMPLETED",
            currentStep: stepNumber,
            consentId: kycAgreement.id,
            updatedAt: new Date(),
          },
        });

        return [kycAgreement, doctorKyc];
      },
    );

    await emailQueue.add("doctor-kyc-completed", {
      email: user.email,
      username: user.username,
    });

    return { kycAgreement, doctorKyc };
  };
}
