/*
  Warnings:

  - You are about to drop the column `memberUserIds` on the `CustomLadderGroup` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CustomLadderGroup" DROP COLUMN "memberUserIds",
ADD COLUMN     "members" JSONB[];
