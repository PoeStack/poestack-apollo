/*
  Warnings:

  - Added the required column `corrupted` to the `CharacterSnapshotItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CharacterSnapshotItem" ADD COLUMN     "corrupted" BOOLEAN NOT NULL,
ADD COLUMN     "gemColor" TEXT,
ADD COLUMN     "socket" INTEGER,
ADD COLUMN     "sockets" JSONB[],
ADD COLUMN     "support" BOOLEAN;
