/*
  Warnings:

  - You are about to drop the `PasswordResetToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."PasswordResetToken" DROP CONSTRAINT "PasswordResetToken_userId_fkey";

-- DropTable
DROP TABLE "public"."PasswordResetToken";

-- CreateTable
CREATE TABLE "OtpToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OtpToken_token_key" ON "OtpToken"("token");

-- AddForeignKey
ALTER TABLE "OtpToken" ADD CONSTRAINT "OtpToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
