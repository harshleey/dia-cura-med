import { sendEmail } from "../email.service";
import fs from "fs";
import path from "path";

export class AuthEmailService {
  static sendResetPasswordEmail(
    to: string,
    username: string,
    resetLink: string,
  ) {
    const templatePath = path.join(
      __dirname,
      "../templates/auth/resetPassword.html",
    );
    let html = fs.readFileSync(templatePath, "utf-8");
    html = html
      .replace("{{resetLink}}", resetLink)
      .replace("{{username}}", username);

    return sendEmail(
      to,
      "Your password reset token (valid for 15 minutes)",
      html,
    );
  }
  static async sendResetPasswordSuccessEmail(email: string, username: string) {
    const templatePath = path.join(
      __dirname,
      "../templates/auth/resetPasswordSuccess.html",
    );
    let html = fs.readFileSync(templatePath, "utf-8");
    html = html.replace("{{username}}", username);

    return sendEmail(email, "Your password has been reset", html);
  }

  //   static sendVerifyEmail(to: string, verificationLink: string) {
  //     const templatePath = path.join(
  //       __dirname,
  //       "../templates/auth/verifyEmail.html",
  //     );
  //     let html = fs.readFileSync(templatePath, "utf-8");
  //     html = html.replace("{{verificationLink}}", verificationLink);

  //     return sendEmail(to, "Verify Your Email", html);
  //   }
}
