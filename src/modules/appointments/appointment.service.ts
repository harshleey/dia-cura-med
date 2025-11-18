import { prisma } from "../../config/db";
import { emailQueue } from "../../queues/email.queue";
import { NotificationService } from "../notifications/notification.service";
import {
  CreateAppointmentDTO,
  UpdateAppointmentDTO,
} from "./appointment.types";
import { NotFoundError } from "../../exceptions/not-found.exception";
import { BadRequestError } from "../../exceptions/bad-request.exception";
import { UnauthorizedError } from "../../exceptions/unauthorized.exception";
import { AvailabilityService } from "../doctor-availability/availability.service";

export class AppointmentService {
  static createAppointment = async (
    patientId: number,
    data: CreateAppointmentDTO,
  ) => {
    // Check if doctor exists and has approved KYC
    const doctor = await prisma.users.findUnique({
      where: { id: data.doctorId },
      include: {
        DoctorKyc: {
          select: {
            kycStatus: true,
          },
        },
      },
    });

    if (!doctor) {
      throw new NotFoundError("Doctor not found");
    }

    if (!doctor.DoctorKyc || doctor.DoctorKyc.kycStatus !== "PASSED") {
      throw new BadRequestError(
        "Doctor is not available for appointments. KYC not approved.",
      );
    }

    await AvailabilityService.ensureAvailability(
      doctor.id,
      data.date.toLocaleString(),
      data.time,
    );

    const appointment = await prisma.appointment.create({
      data: { ...data, patientId },
      include: {
        doctor: {
          select: {
            username: true,
            email: true,
          },
        },
        patient: {
          select: {
            username: true,
            email: true,
            PatientKyc: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // Notify Doctor
    await NotificationService.createNotification({
      userId: appointment.doctorId,
      title: "Appointment request",
      message: `New appointment request from ${appointment.patientId}`,
      type: "APPOINTMENT",
    });

    const formattedDate = appointment.date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Send Email to Doctor
    await emailQueue.add("create-new-appointment", {
      doctorEmail: appointment.doctor.email,
      doctorUsername: appointment.doctor.username,
      patientFirstName: appointment.patient.PatientKyc?.firstName,
      patientLastName: appointment.patient.PatientKyc?.lastName,
      appointmentDate: formattedDate,
      appointmentTime: appointment.time,
    });

    return appointment;
  };

  static updateAppointmentStatus = async (
    appointmentId: string,
    userId: number,
    data: UpdateAppointmentDTO,
  ) => {
    // First, check if the appointment exists and belongs to this doctor
    const appointment = await prisma.appointment.findUnique({
      where: { id: Number(appointmentId) },
      include: {
        patient: { select: { id: true, username: true, email: true } },
        doctor: {
          select: {
            id: true,
            username: true,
            DoctorKyc: { select: { firstName: true, lastName: true } },
            email: true,
          },
        },
      },
    });

    if (!appointment) throw new NotFoundError("Appointment not found");

    const isDoctor = appointment.doctorId === userId;
    const isPatient = appointment.patientId === userId;

    if (!isDoctor && !isPatient) {
      throw new UnauthorizedError("You cannot manage this appointment");
    }

    let newStatus = appointment.status;
    let updated;

    const formattedDate = appointment.date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    /*
     * ─────────── 1. REJECTION ───────────
     */
    if (data.action === "REJECT") {
      newStatus = "REJECTED";

      updated = await prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: newStatus },
      });

      const receiver = isDoctor ? appointment.patient : appointment.doctor;
      const actor = isDoctor ? appointment.doctor : appointment.patient;

      await NotificationService.createNotification({
        userId: receiver.id,
        title: "Appointment Update",
        message: `${isDoctor ? "Doctor" : "Patient"} rejected the appointment.`,
        type: "APPOINTMENT",
      });

      // EMAIL
      await emailQueue.add("reject-appointment", {
        toEmail: receiver.email,
        receiverName: receiver.username,
        rejectedBy: isDoctor
          ? `Dr. ${appointment.doctor.DoctorKyc?.firstName}`
          : appointment.patient.username,
      });

      return updated;
    }

    /*
     * ─────────── 2. ACCEPTANCE ───────────
     */
    if (data.action === "ACCEPT") {
      // Handle acceptance of PENDING appointments (basic flow)
      if (appointment.status === "PENDING") {
        if (!isDoctor) {
          throw new UnauthorizedError(
            "Only doctors can accept pending appointments",
          );
        }

        newStatus = "CONFIRMED";

        updated = await prisma.appointment.update({
          where: { id: appointment.id },
          data: { status: newStatus },
        });

        await NotificationService.createNotification({
          userId: appointment.patientId,
          title: "Appointment Confirmed",
          message: `Dr ${appointment.doctor.DoctorKyc?.firstName} has confirmed your appointment.`,
          type: "APPOINTMENT",
        });

        await emailQueue.add("accept-appointment", {
          toEmail: appointment.patient.email,
          receiverName: appointment.patient.username,
          acceptedBy: `Dr. ${appointment.doctor.DoctorKyc?.firstName}`,
          appointmentDate: formattedDate,
          appointmentTime: appointment.time,
        });

        return updated;
      }

      // Handle acceptance of rescheduled appointments (existing logic)
      if (
        appointment.status === "RESCHEDULED_BY_DOCTOR" ||
        appointment.status === "RESCHEDULED_BY_PATIENT"
      ) {
        newStatus = "RESCHEDULE_CONFIRMED";

        updated = await prisma.appointment.update({
          where: { id: appointment.id },
          data: { status: newStatus },
        });

        const receiver = isDoctor ? appointment.patient : appointment.doctor;
        const actorLabel = isDoctor
          ? `Dr. ${appointment.doctor.DoctorKyc?.firstName ?? "Doctor"}`
          : appointment.patient.username;

        await NotificationService.createNotification({
          userId: receiver.id,
          title: "Reschedule Confirmed",
          message: `The new appointment time has been confirmed.`,
          type: "APPOINTMENT",
        });

        await emailQueue.add("accept-appointment", {
          toEmail: receiver.email,
          receiverName: receiver.username,
          acceptedBy: actorLabel,
          appointmentDate: formattedDate,
          appointmentTime: appointment.time,
        });

        return updated;
      }

      throw new BadRequestError("Nothing to accept for this appointment");
    }

    if (data.action === "RESCHEDULE") {
      if (!data.date || !data.time) {
        throw new BadRequestError("Date and time required for reschedule");
      }

      await AvailabilityService.ensureAvailability(
        appointment.doctorId,
        data.date,
        data.time,
      );

      const newStatus = isDoctor
        ? "RESCHEDULED_BY_DOCTOR"
        : "RESCHEDULED_BY_PATIENT";

      updated = await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          date: new Date(data.date),
          time: data.time,
          status: newStatus,
        },
      });

      const targetUserId = isDoctor
        ? appointment.patientId
        : appointment.doctorId;
      const actorLabel = isDoctor
        ? `Dr. ${appointment.doctor.DoctorKyc?.firstName ?? "Doctor"}`
        : appointment.patient.username;

      // Notification to target
      await NotificationService.createNotification({
        userId: targetUserId,
        title: "Appointment Rescheduled",
        message: `${actorLabel} proposed a new date: ${formattedDate} at ${updated.time}`,
        type: "APPOINTMENT",
      });

      const receiver = isDoctor ? appointment.patient : appointment.doctor;
      await emailQueue.add("reschedule-appointment", {
        toEmail: receiver.email,
        receiverName: receiver.username,
        rescheduledBy: actorLabel,
        appointmentDate: formattedDate,
        appointmentTime: updated.time,
      });
    }

    throw new BadRequestError("Invalid action");
  };

  static getUpcomingAppointments = async (userId: number) => {
    const currentDate = new Date();
    return prisma.appointment.findMany({
      where: {
        OR: [{ doctorId: userId }, { patientId: userId }],
        status: { in: ["PENDING", "ACCEPTED", "RESCHEDULED"] },
        date: {
          gte: currentDate, // Only appointments from current date onwards
        },
      },
      orderBy: {
        date: "asc", // Order by nearest appointment first
      },
      include: {
        doctor: {
          select: {
            username: true,
            email: true,
          },
        },
        patient: {
          select: {
            username: true,
            email: true,
            PatientKyc: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  };

  static getAppointmentHistory = async (userId: number) => {
    const currentDate = new Date();
    return prisma.appointment.findMany({
      where: {
        OR: [{ doctorId: userId }, { patientId: userId }],
        status: { in: ["PENDING", "COMPLETED"] },
        date: {
          lte: currentDate, // Only appointments from current date backwards
        },
      },
      orderBy: {
        date: "asc", // Order by nearest appointment first
      },
      include: {
        doctor: {
          select: {
            username: true,
            email: true,
          },
        },
        patient: {
          select: {
            username: true,
            email: true,
            PatientKyc: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  };

  static getAppointmentById = async (id: number) => {
    return prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: {
          select: {
            username: true,
            email: true,
          },
        },
        patient: {
          select: {
            username: true,
            email: true,
            PatientKyc: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  };

  static startConsultation = async (
    appointmentId: number,
    doctorId: number,
  ) => {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) throw new NotFoundError("Appointment not found");

    if (appointment.doctorId !== doctorId)
      throw new UnauthorizedError("Unauthorized");

    if (
      ![
        "ACCEPTED",
        "RESCHEDULED",
        "RESCHEDULED_BY_DOCTOR",
        "RESCHEDULED_BY_PATIENT",
      ].includes(appointment.status)
    ) {
      throw new BadRequestError(
        "Cannot start consultation for this appointment",
      );
    }

    return prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: "ONGOING" },
    });
  };

  static completeConsultation = async (
    appointmentId: number,
    doctorId: number,
  ) => {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) throw new NotFoundError("Appointment not found");

    if (appointment.doctorId !== doctorId)
      throw new UnauthorizedError("Unauthorized");

    if (appointment.status !== "ONGOING") {
      throw new BadRequestError("Consultation has not started");
    }

    return prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: "COMPLETED" },
    });
  };

  static markMissedAppointments = async () => {
    const now = new Date();

    // Fetch all pending appointments that could become missed
    const appointments = await prisma.appointment.findMany({
      where: {
        status: {
          in: [
            "ACCEPTED",
            "RESCHEDULED",
            "RESCHEDULED_BY_DOCTOR",
            "RESCHEDULED_BY_PATIENT",
          ],
        },
      },
    });

    const missedAppointmentIds: number[] = [];

    for (const appt of appointments) {
      // Combine date + time to produce a real datetime
      const appointmentDate = new Date(appt.date);

      // Extract hours & minutes from the "HH:mm" time format
      const [hours, minutes] = appt.time.split(":").map(Number);

      appointmentDate.setHours(hours);
      appointmentDate.setMinutes(minutes);
      appointmentDate.setSeconds(0);

      // Compare appointment datetime with now
      if (appointmentDate < now) {
        missedAppointmentIds.push(appt.id);
      }
    }

    // Update all missed appointments in bulk
    if (missedAppointmentIds.length > 0) {
      return prisma.appointment.updateMany({
        where: { id: { in: missedAppointmentIds } },
        data: { status: "MISSED" },
      });
    }

    return { count: 0 }; // no missed appointments
  };
}
