import { prisma } from "../../config/db";
import { UnauthorizedError } from "../../exceptions/unauthorized.exception";
import { NotFoundError } from "../../exceptions/not-found.exception";
import {
  PatientListResponseDTO,
  PatientResponseDTO,
  UpdatePatientDTO,
} from "./patient.types";

export class PatientService {
  // Get all patients (only approved doctors)
  static getAllPatients = async (
    search?: string,
  ): Promise<PatientListResponseDTO[]> => {
    const whereClause: any = {
      kycStatus: "COMPLETED",
    };

    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }

    const patients = await prisma.patientKyc.findMany({
      where: whereClause,
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    return patients.map((p: PatientListResponseDTO) => ({
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      phoneNumber: p.phoneNumber,
      gender: p.gender,
      age: p.age,
      kycStatus: p.kycStatus,
    }));
  };

  static getAPatientById = async (
    patientId: number,
  ): Promise<PatientResponseDTO> => {
    const patient = await prisma.patientKyc.findUnique({
      where: { id: patientId, kycStatus: "COMPLETED" },
    });

    if (!patient) throw new NotFoundError("Patient not found.");

    return {
      id: patient.id,
      userId: patient.userId,
      firstName: patient.firstName,
      lastName: patient.lastName,
      phoneNumber: patient.phoneNumber,
      gender: patient.gender,
      age: patient.age,
      dateOfBirth: patient.dateOfBirth?.toISOString() || null,
      diabetesType: patient.diabetesType,
      otherDiabetesType: patient.otherDiabetesType,
      diagnosisDate: patient.diagnosisDate?.toISOString() || null,
      tracksInsulin: patient.tracksInsulin,
      insulinTherapy: patient.insulinTherapy,
      glucoseUnit: patient.glucoseUnit,
      measurementSystem: patient.measurementSystem,
      hasAllergies: patient.hasAllergies,
      allergyDetails: patient.allergyDetails,
      currentMedications: patient.currentMedications,
      kycStatus: patient.kycStatus,
      createdAt: patient.createdAt.toISOString(),
      updatedAt: patient.updatedAt.toISOString(),
    };
  };
}
