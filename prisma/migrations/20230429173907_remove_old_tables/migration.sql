/*
  Warnings:

  - You are about to drop the `PoeLeagueActivitySnapshot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PoePublicStashUpdateRecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PublicStashListing` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StashSnapshot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StashSnapshotItemGroupSummary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StashSnapshotProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StashSnapshot" DROP CONSTRAINT "StashSnapshot_snapshotProfileId_userId_fkey";

-- DropForeignKey
ALTER TABLE "StashSnapshot" DROP CONSTRAINT "StashSnapshot_userId_fkey";

-- DropForeignKey
ALTER TABLE "StashSnapshotItemGroupSummary" DROP CONSTRAINT "StashSnapshotItemGroupSummary_stashSnapshotId_fkey";

-- DropForeignKey
ALTER TABLE "StashSnapshotItemGroupSummary" DROP CONSTRAINT "StashSnapshotItemGroupSummary_userId_fkey";

-- DropForeignKey
ALTER TABLE "StashSnapshotProfile" DROP CONSTRAINT "StashSnapshotProfile_userId_fkey";

-- DropTable
DROP TABLE "PoeLeagueActivitySnapshot";

-- DropTable
DROP TABLE "PoePublicStashUpdateRecord";

-- DropTable
DROP TABLE "PublicStashListing";

-- DropTable
DROP TABLE "StashSnapshot";

-- DropTable
DROP TABLE "StashSnapshotItemGroupSummary";

-- DropTable
DROP TABLE "StashSnapshotProfile";
