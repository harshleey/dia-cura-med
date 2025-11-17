import { z } from "zod";

// export const createAppointmentSchema = z.object({
//   doctorId: z
//     .number({
//       message: "Doctor ID must be a number",
//     })
//     .int()
//     .positive({
//       message: "Doctor ID must be a positive number",
//     }),
//   date: z.string().datetime(),
//   time: z.string(),
//   patientNote: z.string().optional(),
// });
export const createAppointmentSchema = z
  .object({
    doctorId: z
      .number({
        message: "Doctor ID must be a number",
      })
      .int()
      .positive({
        message: "Doctor ID must be a positive number",
      }),
    date: z
      .string()
      .or(z.date())
      .refine(
        (val) => {
          const date = new Date(val);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date >= today;
        },
        {
          message: "Appointment date cannot be in the past",
        },
      ),
    time: z.string().refine(
      (val) => {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(val);
      },
      {
        message: "Time must be in HH:MM format (24-hour)",
      },
    ),
    patientNote: z.string().optional(),
  })
  .refine(
    (data) => {
      const appointmentDate = new Date(data.date);
      const [hours, minutes] = data.time.split(":").map(Number);

      // Create the full appointment datetime
      const appointmentDateTime = new Date(appointmentDate);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      const now = new Date();

      return appointmentDateTime >= now;
    },
    {
      message:
        "Appointment date and time cannot be in the past. Please select a future date and time.",
      path: ["time"],
    },
  );

export const updateAppointmentStatusSchema = z
  .object({
    action: z.enum(["ACCEPT", "REJECT", "RESCHEDULE"]),
    date: z.string().datetime().optional(),
    time: z.string().optional(),
  })
  .refine((data) => {
    if (data.action === "RESCHEDULE") {
      if (!data.date && !data.time) {
        throw new z.ZodError([
          {
            code: z.ZodIssueCode.custom,
            message: "Date and time are required when rescheduling",
            path: ["date"],
          },
          {
            code: z.ZodIssueCode.custom,
            message: "Date and time are required when rescheduling",
            path: ["time"],
          },
        ]);
      }
      if (!data.date) {
        throw new z.ZodError([
          {
            code: z.ZodIssueCode.custom,
            message: "Date is required when rescheduling",
            path: ["date"],
          },
        ]);
      }
      if (!data.time) {
        throw new z.ZodError([
          {
            code: z.ZodIssueCode.custom,
            message: "Time is required when rescheduling",
            path: ["time"],
          },
        ]);
      }
    }
    return true;
  });

export const appointmentIdSchema = z.object({
  appointmentId: z.number(),
});
