/*
  Warnings:

  - The `hashes` column on the `CharacterPassivesSnapshot` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `hashesEx` column on the `CharacterPassivesSnapshot` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "CharacterPassivesSnapshot" ALTER COLUMN "banditChoice" DROP NOT NULL,
ALTER COLUMN "pantheonMajor" DROP NOT NULL,
ALTER COLUMN "pantheonMinor" DROP NOT NULL,
DROP COLUMN "hashes",
ADD COLUMN     "hashes" INTEGER[],
DROP COLUMN "hashesEx",
ADD COLUMN     "hashesEx" INTEGER[];

-- AlterTable
ALTER TABLE "CharacterSnapshotItem" ALTER COLUMN "baseType" DROP NOT NULL,
ALTER COLUMN "typeLine" DROP NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;
