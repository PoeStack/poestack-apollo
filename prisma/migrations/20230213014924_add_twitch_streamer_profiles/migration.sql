/*
  Warnings:

  - You are about to drop the column `twitchName` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `twitchViewCount` on the `UserProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "twitchName",
DROP COLUMN "twitchViewCount";

-- CreateTable
CREATE TABLE "TwitchStreamerProfile" (
    "userId" TEXT NOT NULL,
    "profileName" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL,
    "lastVideoTimestamp" TIMESTAMP(3) NOT NULL,
    "updatedAtTimestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TwitchStreamerProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "TwitchStreamerProfile_userId_key" ON "TwitchStreamerProfile"("userId");

-- AddForeignKey
ALTER TABLE "TwitchStreamerProfile" ADD CONSTRAINT "TwitchStreamerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
