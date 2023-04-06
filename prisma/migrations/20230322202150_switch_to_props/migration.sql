/*
  Warnings:

  - You are about to drop the column `channelid` on the `DiscordServiceMessageRecord` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `DiscordServiceMessageRecord` table. All the data in the column will be lost.
  - Added the required column `channelId` to the `DiscordServiceMessageRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `properties` to the `DiscordServiceMessageRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `DiscordServiceMessageRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DiscordServiceMessageRecord" DROP COLUMN "channelid",
DROP COLUMN "content",
ADD COLUMN     "channelId" TEXT NOT NULL,
ADD COLUMN     "properties" JSONB NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;
