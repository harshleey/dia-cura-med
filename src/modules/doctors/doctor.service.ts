import { prisma } from "../../config/db";
import { NotFoundError } from "../../exceptions/not-found.exception";
import { DoctorResponseDTO, DoctorListResponseDTO } from "./doctor.types";

export class DoctorService {
  // ✅ Get all doctors (only ADMIN)
  static getAllApprovedDoctors = async (): Promise<DoctorListResponseDTO[]> => {
    const doctors = await prisma.doctorKyc.findMany({
      where: { kycStatus: "PASSED" },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    return doctors.map((d) => ({
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
