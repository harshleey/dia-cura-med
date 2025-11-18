import cron from "node-cron";
import { AppointmentService } from "../modules/appointments/appointment.service";

cron.schedule("*/5 * * * *", async () => {
  console.log("Checking for missed appointments...");
  await AppointmentService.markMissedAppointments();
  console.log("Missed appointments updated");
});
