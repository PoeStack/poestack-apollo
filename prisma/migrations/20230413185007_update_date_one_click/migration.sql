/*
  Warnings:

  - You are about to drop the column `poestackUserId` on the `OneClickMessageHistory` table. All the data in the column will be lost.
  - You are about to drop the column `rateLimitKey` on the `OneClickMessageHistory` table. All the data in the column will be lost.
  - Added the required column `target` to the `OneClickMessageHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `OneClickMessageHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OneClickMessageHistory" DROP COLUMN "poestackUserId",
DROP COLUMN "rateLimitKey",
ADD COLUMN     "target" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;
