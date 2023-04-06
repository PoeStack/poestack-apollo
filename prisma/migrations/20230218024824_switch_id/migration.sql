/*
  Warnings:

  - The primary key for the `CustomLadderGroup` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "CustomLadderGroup" DROP CONSTRAINT "CustomLadderGroup_pkey",
ADD CONSTRAINT "CustomLadderGroup_pkey" PRIMARY KEY ("id", "ownerUserId");
