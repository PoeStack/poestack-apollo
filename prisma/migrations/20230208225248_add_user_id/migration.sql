/*
  Warnings:

  - Added the required column `experience` to the `CharacterPassivesSnapshotRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level` to the `CharacterPassivesSnapshotRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `CharacterPassivesSnapshotRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `CharacterPassivesSnapshotRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CharacterPassivesSnapshotRecord" ADD COLUMN     "experience" BIGINT NOT NULL,
ADD COLUMN     "level" INTEGER NOT NULL,
ADD COLUMN     "source" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;
