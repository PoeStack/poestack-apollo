/*
  Warnings:

  - You are about to drop the column `assendancyClassName` on the `CharacterSnapshotSearchableSummary` table. All the data in the column will be lost.
  - You are about to drop the column `mainSkill` on the `CharacterSnapshotSearchableSummary` table. All the data in the column will be lost.
  - Added the required column `characterClass` to the `CharacterSnapshotSearchableSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAtTimestamp` to the `CharacterSnapshotSearchableSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mainSkillKey` to the `CharacterSnapshotSearchableSummary` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CharacterSnapshotSearchableSummary_assendancyClassName_idx";

-- DropIndex
DROP INDEX "CharacterSnapshotSearchableSummary_mainSkill_idx";

-- AlterTable
ALTER TABLE "CharacterSnapshotSearchableSummary" DROP COLUMN "assendancyClassName",
DROP COLUMN "mainSkill",
ADD COLUMN     "characterClass" TEXT NOT NULL,
ADD COLUMN     "createdAtTimestamp" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "mainSkillKey" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary_createdAtTimestamp_idx" ON "CharacterSnapshotSearchableSummary"("createdAtTimestamp");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary_mainSkillKey_idx" ON "CharacterSnapshotSearchableSummary"("mainSkillKey");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary_characterClass_idx" ON "CharacterSnapshotSearchableSummary"("characterClass");
