/*
  Warnings:

  - The `plan` column on the `Subscription` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `Founder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Waitlist` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'STARTER', 'GROWTH', 'PRO');

-- DropForeignKey
ALTER TABLE "ReferralEvent" DROP CONSTRAINT "ReferralEvent_refereeId_fkey";

-- DropForeignKey
ALTER TABLE "ReferralEvent" DROP CONSTRAINT "ReferralEvent_referrerId_fkey";

-- DropForeignKey
ALTER TABLE "ReferralEvent" DROP CONSTRAINT "ReferralEvent_waitlistId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_founderId_fkey";

-- DropForeignKey
ALTER TABLE "Waitlist" DROP CONSTRAINT "Waitlist_founderId_fkey";

-- DropForeignKey
ALTER TABLE "WaitlistMember" DROP CONSTRAINT "WaitlistMember_waitlistId_fkey";

-- AlterTable
ALTER TABLE "Founder" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "plan",
ADD COLUMN     "plan" "Plan" NOT NULL DEFAULT 'FREE';

-- AlterTable
ALTER TABLE "Waitlist" ADD COLUMN     "customCss" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "accentColor" SET DEFAULT '#6366f1';

-- DropEnum
DROP TYPE "PlanEnum";

-- CreateIndex
CREATE INDEX "WaitlistMember_waitlistId_position_idx" ON "WaitlistMember"("waitlistId", "position");

-- AddForeignKey
ALTER TABLE "Waitlist" ADD CONSTRAINT "Waitlist_founderId_fkey" FOREIGN KEY ("founderId") REFERENCES "Founder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaitlistMember" ADD CONSTRAINT "WaitlistMember_waitlistId_fkey" FOREIGN KEY ("waitlistId") REFERENCES "Waitlist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_founderId_fkey" FOREIGN KEY ("founderId") REFERENCES "Founder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
