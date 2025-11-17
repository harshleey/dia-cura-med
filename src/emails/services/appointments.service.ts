import { sendEmail } from "../email.service";
import fs from "fs";
import path from "path";

export class AppointmentsEmailService {
  static sendCreateAppointmentEmail(
    to: string,
    doctorUsername: string,
    patientFirstName: string,
    patientLastName: string,
    appointmentDate: string,
    appointmentTime: string,
  ) {
    const templatePath = path.join(
      __dirname,
      "../templates/appointments/CreateAppointment.html",
    );
    let html = fs.readFileSync(templatePath, "utf-8");

    // Replace multiple placeholders
    html = html.replace("{{doctorName}}", doctorUsername);
    html = html.replace("{{patientFirstName}}", patientFirstName);
    html = html.replace("{{patientLastName}}", patientLastName);
    html = html.replace("{{appointmentDate}}", appointmentDate);
    html = html.replace("{{appointmentTime}}", appointmentTime);

    return sendEmail(to, "Appointment Created Successfully!", html);
  }

  static sendAcceptAppointmentEmail(
    toEmail: string,
    receiverName: string,
    acceptedBy: string,
    appointmentDate: string,
    appointmentTime: string,
  ) {
    const templatePath = path.join(
      __dirname,
      "../templates/appointments/AcceptAppointment.html",
    );
    let html = fs.readFileSync(templatePath, "utf-8");

    // Replace multiple placeholders
    html = html.replace("{{receiverName}}", receiverName);
    html = html.replace("{{acceptedBy}}", acceptedBy);
    html = html.replace("{{date}}", appointmentDate);
    html = html.replace("{{time}}", appointmentTime);

    return sendEmail(toEmail, "Appointment Accepted Successfully!", html);
  }

  static sendRejectAppointmentEmail(
    toEmail: string,
    receiverName: string,
    rejectedBy: string,
  ) {
    const templatePath = path.join(
      __dirname,
      "../templates/appointments/RejectAppointment.html",
    );
    let html = fs.readFileSync(templatePath, "utf-8");

    // Replace multiple placeholders
    html = html.replace("{{receiverName}}", receiverName);
    html = html.replace("{{rejectedBy}}", rejectedBy);

    return sendEmail(toEmail, "Appointment Rejected 😔", html);
  }

  static sendRescheduleAppointmentEmail(
    toEmail: string,
    receiverName: string,
    rescheduledBy: string,
    appointmentDate: string,
    appointmentTime: string,
  ) {
    const templatePath = path.join(
      __dirname,
      "../templates/appointments/RescheduleAppointment.html",
    );
    let html = fs.readFileSync(templatePath, "utf-8");

    // Replace multiple placeholders
    html = html.replace("{{receiverName}}", receiverName);
    html = html.replace("{{doctorName}}", rescheduledBy);
    html = html.replace("{{newDate}}", appointmentDate);
    html = html.replace("{{newTime}}", appointmentTime);

    return sendEmail(toEmail, "Appointment Rescheduled Successfully!", html);
  }
}
