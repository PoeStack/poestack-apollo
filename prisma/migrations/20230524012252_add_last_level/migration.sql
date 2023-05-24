-- AlterTable
ALTER TABLE "PoeCharacter" ADD COLUMN     "lastLevel" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastLevelChangeTimestamp" TIMESTAMP(3);
