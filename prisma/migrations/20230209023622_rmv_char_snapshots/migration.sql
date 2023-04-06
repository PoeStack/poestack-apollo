/*
  Warnings:

  - You are about to drop the `CharacterPassivesSnapshot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CharacterSnapshot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CharacterSnapshotItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CharacterSnapshotPobStats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CharacterSnapshotSearchableSummary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PassiveNodeOnCharacterSnapshot` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CharacterPassivesSnapshot" DROP CONSTRAINT "CharacterPassivesSnapshot_snapshotId_fkey";

-- DropForeignKey
ALTER TABLE "CharacterSnapshot" DROP CONSTRAINT "CharacterSnapshot_characterId_fkey";

-- DropForeignKey
ALTER TABLE "CharacterSnapshotItem" DROP CONSTRAINT "CharacterSnapshotItem_snapshotId_fkey";

-- DropForeignKey
ALTER TABLE "CharacterSnapshotPobStats" DROP CONSTRAINT "CharacterSnapshotPobStats_snapshotId_fkey";

-- DropForeignKey
ALTER TABLE "PassiveNodeOnCharacterSnapshot" DROP CONSTRAINT "PassiveNodeOnCharacterSnapshot_passiveNodeHash_passiveTree_fkey";

-- DropForeignKey
ALTER TABLE "PassiveNodeOnCharacterSnapshot" DROP CONSTRAINT "PassiveNodeOnCharacterSnapshot_snapshotId_fkey";

-- DropTable
DROP TABLE "CharacterPassivesSnapshot";

-- DropTable
DROP TABLE "CharacterSnapshot";

-- DropTable
DROP TABLE "CharacterSnapshotItem";

-- DropTable
DROP TABLE "CharacterSnapshotPobStats";

-- DropTable
DROP TABLE "CharacterSnapshotSearchableSummary";

-- DropTable
DROP TABLE "PassiveNodeOnCharacterSnapshot";
