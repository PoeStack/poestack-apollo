/*
  Warnings:

  - The primary key for the `StashSnapshotProfile` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "StashSnapshot" DROP CONSTRAINT "StashSnapshot_snapshotProfileId_fkey";

-- AlterTable
ALTER TABLE "StashSnapshotProfile" DROP CONSTRAINT "StashSnapshotProfile_pkey",
ADD CONSTRAINT "StashSnapshotProfile_pkey" PRIMARY KEY ("id", "userId");

-- AddForeignKey
ALTER TABLE "StashSnapshot" ADD CONSTRAINT "StashSnapshot_snapshotProfileId_userId_fkey" FOREIGN KEY ("snapshotProfileId", "userId") REFERENCES "StashSnapshotProfile"("id", "userId") ON DELETE CASCADE ON UPDATE CASCADE;
