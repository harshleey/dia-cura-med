import { sendEmail } from "../email.service";
import fs from "fs";
import path from "path";
// import welcomeEmail from "../templates/users/welcomeEmail.html"

export class KycEmailService {
  static sendPatientKycCompletedEmail(to: string, username: string) {
    const templatePath = path.join(
      __dirname,
      "../templates/kyc/PatientKycCompleted.html",
    );
    let html = fs.readFileSync(templatePath, "utf-8");
    html = html.replace("{{username}}", username);

    return sendEmail(to, "Kyc Completed Successfully!", html);
  }

  static sendDoctorKycCompletedEmail(to: string, username: string) {
    const templatePath = path.join(
      __dirname,
      "../templates/kyc/DoctorKycCompleted.html",
    );
    let html = fs.readFileSync(templatePath, "utf-8");
    html = html.replace("{{username}}", username);

    return sendEmail(to, "Kyc Completed Successfully!", html);
  }
}
