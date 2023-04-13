/*
  Warnings:

  - You are about to drop the column `target` on the `OneClickMessageHistory` table. All the data in the column will be lost.
  - Added the required column `channelId` to the `OneClickMessageHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exportSubType` to the `OneClickMessageHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exportType` to the `OneClickMessageHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OneClickMessageHistory" DROP COLUMN "target",
ADD COLUMN     "channelId" TEXT NOT NULL,
ADD COLUMN     "exportSubType" TEXT NOT NULL,
ADD COLUMN     "exportType" TEXT NOT NULL;
