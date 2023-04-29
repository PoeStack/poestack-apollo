/*
  Warnings:

  - The primary key for the `TftLiveListing` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `TftLiveListing` table. All the data in the column will be lost.
  - Added the required column `channelId` to the `TftLiveListing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `messageId` to the `TftLiveListing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TftLiveListing" DROP CONSTRAINT "TftLiveListing_pkey",
DROP COLUMN "id",
ADD COLUMN     "channelId" TEXT NOT NULL,
ADD COLUMN     "messageId" TEXT NOT NULL,
ADD CONSTRAINT "TftLiveListing_pkey" PRIMARY KEY ("messageId");
