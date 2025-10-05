import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../config/db";
import { BadRequestError } from "../exceptions/bad-request.exception";

export const generateOtpToken = async () => {
  // generate OTP Token
  const generatedOtpToken = await crypto.randomBytes(32).toString("hex");

  // Hash Otp
  const hashedOtpToken = await bcrypt.hash(generatedOtpToken, 12);

  return { generatedOtpToken, hashedOtpToken };
};

export const verifyOtpToken = async (token: string, id: string) => {
  // ensure otp record exist
  const matchedOTPRecord = await prisma.otpToken.findFirst({
    where: { userId: Number(id), expiresAt: { gt: new Date() } },
  });

  if (!matchedOTPRecord) {
    throw new BadRequestError("Could not find OTP record");
  }

  // check for expired code
  const { expiresAt } = matchedOTPRecord;

  const currentDateTime = new Date();
  const isExpired = currentDateTime > new Date(expiresAt);

  if (isExpired) {
    await prisma.otpToken.deleteMany({ where: { userId: Number(id) } });
    throw new BadRequestError("Code has expired. Request for a new one.");
  }

  // check if Token Match
  const hashedOTP = matchedOTPRecord.token;
  const verifyOTP = await bcrypt.compare(token, hashedOTP);

  if (!verifyOTP) {
    throw new BadRequestError("Invalid Token");
  }

  await prisma.otpToken.deleteMany({ where: { userId: Number(id) } });

  return verifyOTP;
};

// const generateResetOtpToken = async (user) => {
//   try {
//     // clear any old record
//     await database.otpToken.deleteMany({
//       where: { userId: user.id },
//     });

//     // generate OTP Token
//     const generatedOtpToken = await crypto.randomBytes(32).toString("hex");

//     // save otp record
//     const hashedOtpToken = await bcrypt.hash(generatedOtpToken, 10);

//     await database.otpToken.create({
//       data: {
//         userId: user.id,
//         token: hashedOtpToken,
//         expiresAt: new Date(Date.now() + 10 * 60 * 1000), // in hours
//       },
//     });
//     return generatedOtpToken;
//   } catch (err) {
//     throw new CustomErrorApi(err.message, StatusCodes.INTERNAL_SERVER_ERROR);
//   }
// };
