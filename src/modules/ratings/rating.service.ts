import { prisma } from "../../config/db";
import { BadRequestError } from "../../exceptions/bad-request.exception";
import { NotFoundError } from "../../exceptions/not-found.exception";
import { UnauthorizedError } from "../../exceptions/unauthorized.exception";
import { CreateRatingDTO } from "./rating.types";

export class RatingService {
  static rateDoctor = async (patientId: number, data: CreateRatingDTO) => {
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: data.appointmentId,
        doctorId: data.doctorId,
        patientId,
        status: "COMPLETED",
      },
    });

    if (!appointment) {
      throw new BadRequestError(
        "You can only rate doctors for completed appointments",
      );
    }

    // Prevent double ratings
    const existing = await prisma.doctorRating.findFirst({
      where: {
        appointmentId: data.appointmentId,
        patientId,
      },
    });

    if (existing) {
      throw new BadRequestError("You already rated this appointment");
    }

    return prisma.doctorRating.create({
      data: {
        doctorId: data.doctorId,
        patientId,
        appointmentId: data.appointmentId,
        rating: data.rating,
        comment: data.comment,
      },
    });
  };

  static getDoctorRatings = async (doctorId: number) => {
    const ratings = prisma.doctorRating.findMany({
      where: { doctorId },
      orderBy: { createdAt: "desc" },
      include: {
        patient: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        appointment: {
          select: {
            id: true,
            date: true,
            time: true,
          },
        },
      },
    });

    return ratings;
  };

  static getRatingById = async (userId: number, ratingId: number) => {
    const rating = await prisma.doctorRating.findUnique({
      where: { id: ratingId },
      include: {
        doctor: {
          select: { id: true, username: true },
        },
        patient: {
          select: { id: true, username: true },
        },
        appointment: {
          select: { id: true, date: true, time: true },
        },
      },
    });

    if (!rating) throw new NotFoundError("Rating not found");

    // Ensure only doctor/patient involved or admin can view
    if (userId !== rating.doctorId || userId !== rating.patientId) {
      throw new UnauthorizedError("Access Denied");
    }

    return rating;
  };
}
