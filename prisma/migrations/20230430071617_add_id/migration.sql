/*
  Warnings:

  - The primary key for the `TftLiveListing` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "TftLiveListing" DROP CONSTRAINT "TftLiveListing_pkey",
ADD CONSTRAINT "TftLiveListing_pkey" PRIMARY KEY ("userDiscordId", "channelId");
