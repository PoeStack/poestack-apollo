/*
  Warnings:

  - You are about to drop the `DiscordServiceMessageRecord` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "StashViewValueSnapshot" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'tab value',
ALTER COLUMN "stashId" DROP NOT NULL;

-- DropTable
DROP TABLE "DiscordServiceMessageRecord";
