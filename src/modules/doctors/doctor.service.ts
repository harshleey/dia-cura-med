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

  // // ✅ Update doctor (only the doctor)
  // async updateDoctor(
  //   userId: number,
  //   data: UpdateDoctorDTO,
  // ): Promise<DoctorResponseDTO> {
  //   const doctor = await prisma.doctorKyc.findUnique({
  //     where: { userId },
  //   });

  //   if (!doctor) throw new Error("Doctor not found.");

  //   const updated = await prisma.doctorKyc.update({
  //     where: { userId },
  //     data: {
  //       ...data,
  //       dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
  //     },
  //   });

  //   return {
  //     id: updated.id,
  //     userId: updated.userId,
  //     firstName: updated.firstName,
  //     lastName: updated.lastName,
  //     email: updated.email,
  //     countryOfResidence: updated.countryOfResidence,
  //     cityOfResidence: updated.cityOfResidence,
  //     phoneNumber: updated.phoneNumber,
  //     gender: updated.gender,
  //     dateOfBirth: updated.dateOfBirth?.toISOString() || null,
  //     hospitalIdCardUrl: updated.hospitalIdCardUrl,
  //     medicalCertificateUrl: updated.medicalCertificateUrl,
  //     nationalIdUrl: updated.nationalIdUrl,
  //     selfieUrl: updated.selfieUrl,
  //     assessmentSent: updated.assessmentSent,
  //     assessmentSentAt: updated.assessmentSentAt?.toISOString() || null,
  //     assessmentUploadUrl: updated.assessmentUploadUrl,
  //     assessmentScore: updated.assessmentScore,
  //     kycStatus: updated.kycStatus,
  //     createdAt: updated.createdAt.toISOString(),
  //     updatedAt: updated.updatedAt.toISOString(),
  //   };
  // }

  // // ✅ Delete doctor (doctor or admin)
  // async deleteDoctor(
  //   doctorId: number,
  //   requester: { id: number; role: string },
  // ): Promise<{ message: string }> {
  //   const doctor = await prisma.doctorKyc.findUnique({
  //     where: { id: doctorId },
  //     include: { user: true },
  //   });

  //   if (!doctor) throw new Error("Doctor not found.");

  //   const isOwner = doctor.userId === requester.id;
  //   const isAdmin = requester.role === "ADMIN";

  //   if (!isOwner && !isAdmin)
  //     throw new Error("Unauthorized: You cannot delete this doctor.");

  //   await prisma.doctorKyc.delete({ where: { id: doctorId } });
  //   await prisma.users.delete({ where: { id: doctor.userId } });

  //   return { message: "Doctor deleted successfully." };
  // }
}
