import { prisma } from "../../config/db";
import { NotFoundError } from "../../exceptions/not-found.exception";
import { DoctorResponseDTO, DoctorListResponseDTO } from "./doctor.types";

export class DoctorService {
  // ✅ Get all doctors (only ADMIN)
  static getAllApprovedDoctors = async (
    search?: string,
  ): Promise<DoctorListResponseDTO[]> => {
    const whereClause: any = {
      kycStatus: "PASSED",
    };

    // Optional search filter
    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const doctors = await prisma.doctorKyc.findMany({
      where: whereClause,
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    return doctors.map((d: DoctorListResponseDTO) => ({
      id: d.id,
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email,
      countryOfResidence: d.countryOfResidence,
      cityOfResidence: d.cityOfResidence,
      kycStatus: d.kycStatus,
    }));
  };

  // ✅ Get one doctor (ADMIN or the doctor themselves)
  static getApprovedDoctorById = async (
    doctorId: number,
  ): Promise<DoctorResponseDTO> => {
    const doctor = await prisma.doctorKyc.findUnique({
      where: { id: doctorId, kycStatus: "PASSED" },
    });

    if (!doctor) throw new NotFoundError("Doctor not found.");

    return {
      id: doctor.id,
      userId: doctor.userId,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      countryOfResidence: doctor.countryOfResidence,
      cityOfResidence: doctor.cityOfResidence,
      phoneNumber: doctor.phoneNumber,
      gender: doctor.gender,
      dateOfBirth: doctor.dateOfBirth?.toISOString() || null,
      selfieUrl: doctor.selfieUrl,
      kycStatus: doctor.kycStatus,
      createdAt: doctor.createdAt.toISOString(),
      updatedAt: doctor.updatedAt.toISOString(),
    };
  };
}
