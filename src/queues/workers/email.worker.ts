import { Worker } from "bullmq";
import IORedis from "ioredis";
import { UserEmailService } from "../../emails/services/user-email.service";
import { redisConnection } from "../../config/redis";
import { AuthEmailService } from "../../emails/services/auth-email.service";
import { KycEmailService } from "../../emails/services/kyc-email.service";

export const emailWorker = new Worker(
  "email-queue",
  async (job) => {
    if (job.name === "send-welcome-email") {
      const { email, username } = job.data;
      await AuthEmailService.sendWelcomeEmail(email, username);
    }

    if (job.name === "send-password-reset") {
      const { email, username, token, user } = job.data;
      const resetLink = `https://${process.env.FRONTEND_URL}/reset-password?token=${token}?id=${user.id}`;
      await AuthEmailService.sendResetPasswordEmail(email, username, resetLink);
    }

    if (job.name === "send-password-reset-success") {
      const { email, username } = job.data;
      await AuthEmailService.sendResetPasswordSuccessEmail(email, username);
    }

    if (job.name === "patient-kyc-completed") {
      const { email, username } = job.data;
      await KycEmailService.sendPatientKycCompletedEmail(email, username);
    }

    if (job.name === "doctor-kyc-completed") {
      const { email, username } = job.data;
      await KycEmailService.sendDoctorKycCompletedEmail(email, username);
    }
  },
  { connection: redisConnection },
);
