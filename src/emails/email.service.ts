import nodemailer from "nodemailer";

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  secure: false,
  port: Number(SMTP_PORT),
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  return transporter.sendMail({
    from: `"Dia-Cure Med"`,
    to,
    subject,
    html,
  });
};
