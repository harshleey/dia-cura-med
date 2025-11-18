import { prisma } from "../../config/db";
import { BadRequestError } from "../../exceptions/bad-request.exception";
import { NotFoundError } from "../../exceptions/not-found.exception";
import { UnauthorizedError } from "../../exceptions/unauthorized.exception";
import { emailQueue } from "../../queues/email.queue";
import {
  AvailabilityResponseDto,
  CreateAvailabilityDTO,
  UpdateAvailabilityDTO,
} from "./availability.types";
export class AvailabilityService {
  static createAvailability = async (
    doctorId: number,
    data: CreateAvailabilityDTO,
  ) => {
    const existing = await prisma.doctorAvailability.findFirst({
      where: { doctorId, date: new Date(data.date) },
    });

    if (existing)
      throw new BadRequestError("Availability for this date already exists");

    return prisma.doctorAvailability.create({
      data: {
        doctorId,
        date: new Date(data.date),
        times: {
          create: data.times.map((t) => ({
            startTime: t.startTime,
            endTime: t.endTime,
          })),
        },
      },
      include: { times: true },
    });
  };

  static getAllAvailability = async (
    doctorId: number,
  ): Promise<AvailabilityResponseDto[]> => {
    const availability = await prisma.doctorAvailability.findMany({
      where: { doctorId },
      include: {
        times: {
          orderBy: { startTime: "asc" },
        },
      },
      orderBy: { date: "asc" },
    });

    return availability.map((a) => ({
      id: a.id.toString(),
      doctorId: a.doctorId.toString(),
      date: a.date.toISOString(),
      createdAt: a.createdAt,
      times: a.times.map((t) => ({
        id: t.id,
        startTime: t.startTime,
        endTime: t.endTime,
      })),
    }));
  };

  static getAvailability = async (
    id: number,
  ): Promise<AvailabilityResponseDto> => {
    const availability = await prisma.doctorAvailability.findUnique({
      where: { id },
      include: { times: true },
    });

    if (!availability) throw new NotFoundError("Availability not found");

    return {
      id: availability.id.toString(),
      doctorId: availability.doctorId.toString(),
      date: availability.date.toISOString(),
      times: availability.times.map((t) => ({
        id: t.id,
        startTime: t.startTime,
        endTime: t.endTime,
      })),
      createdAt: availability.createdAt,
    };
  };

  static updateAvailability = async (
    id: number,
    doctorId: number,
    data: UpdateAvailabilityDTO,
  ) => {
    const availability = await prisma.doctorAvailability.findUnique({
      where: { id },
    });

    if (!availability) throw new NotFoundError("Availability not found");
    if (availability.doctorId !== doctorId) {
      throw new UnauthorizedError("You cannot edit this availability");
    }

    return prisma.doctorAvailability.update({
      where: { id },
      data: {
        date: data.date ? new Date(data.date) : availability.date,
        times: data.times
          ? {
              deleteMany: {}, // remove old times
              create: data.times.map((t) => ({
                startTime: t.startTime,
                endTime: t.endTime,
              })),
            }
          : undefined,
      },
      include: { times: true },
    });
  };

  static deleteAvailability = async (id: number, doctorId: number) => {
    const availability = await prisma.doctorAvailability.findUnique({
      where: { id },
    });

    if (!availability) throw new NotFoundError("Availability not found");

    if (availability.doctorId !== doctorId) {
      throw new UnauthorizedError("You cannot delete this availability");
    }

    await prisma.doctorAvailability.delete({ where: { id } });

    return { message: "Availability deleted" };
  };

  // Used when scheduling or rescheduling
  static ensureAvailability = async (
    doctorId: number,
    date: string,
    time: string,
  ) => {
    const availability = await prisma.doctorAvailability.findFirst({
      where: {
        doctorId,
        date: new Date(date),
      },
      include: {
        times: true,
      },
    });

    if (!availability) {
      throw new BadRequestError("Doctor is not available at this date & time");
    }

    const isInsideRange = availability.times.some((t) => {
      return time >= t.startTime && time <= t.endTime;
    });

    if (!isInsideRange) {
      throw new BadRequestError("Doctor is not available at this time");
    }

    return true;
  };
}
