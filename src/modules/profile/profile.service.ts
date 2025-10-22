import { prisma } from "../../config/db";
import { UnauthorizedError } from "../../exceptions/unauthorized.exception";
import { NotFoundError } from "../../exceptions/not-found.exception";
import { ProfileResponseDTO, UpdateProfileDTO } from "./profile.types";

export class ProfileService {
  static getProfile = async (userId: number): Promise<ProfileResponseDTO> => {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        DoctorKyc: true,
        PatientKyc: true,
      },
    });

    if (!user) throw new NotFoundError("User not found");

    const profile =
      user.role === "DOCTOR"
        ? user.DoctorKyc
        : user.role === "PATIENT"
          ? user.PatientKyc
          : null;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profile,
    };
  };

  static updateProfile = async (
    userId: number,
    data: UpdateProfileDTO,
  ): Promise<ProfileResponseDTO> => {
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundError("User not found");

    // Update based on role
    if (user.role === "DOCTOR") {
      await prisma.doctorKyc.updateMany({
        where: { userId },
        data: {
          phoneNumber: data.phoneNumber,
          countryOfResidence: data.countryOfResidence,
          cityOfResidence: data.cityOfResidence,
        },
      });
    } else if (user.role === "PATIENT") {
      await prisma.patientKyc.updateMany({
        where: { userId },
        data: {
          phoneNumber: data.phoneNumber,
          hasAllergies: data.hasAllergies,
          allergyDetails: data.allergyDetails,
        },
      });
    }

    return this.getProfile(userId);
  };

  static deleteProfile = async (userId: number): Promise<void> => {
    await prisma.$transaction(async (tx) => {
      const user = await tx.users.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user) {
        throw new NotFoundError("User not found");
      }

      await tx.userSession.deleteMany({ where: { userId } });

      if (user.role === "PATIENT") {
        await tx.patientKyc.deleteMany({ where: { userId } });
      }

      if (user.role === "DOCTOR") {
        await tx.doctorKyc.deleteMany({ where: { userId } });
      }

      await tx.consentAgreement.delete({ where: { userId } });

      await tx.users.delete({ where: { id: userId } });
    });
  };
}
