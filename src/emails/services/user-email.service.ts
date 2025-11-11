import { sendEmail } from "../email.service";
import fs from "fs";
import path from "path";
// import welcomeEmail from "../templates/users/welcomeEmail.html"

export class UserEmailService {
  //   static sendProfileUpdateEmail(to: string, name: string) {
  //     const templatePath = path.join(
  //       __dirname,
  //       "../templates/users/profileUpdate.html",
  //     );
  //     let html = fs.readFileSync(templatePath, "utf-8");
  //     html = html.replace("{{name}}", name);
  //     return sendEmail(to, "Profile Updated Successfully", html);
  //   }
}
