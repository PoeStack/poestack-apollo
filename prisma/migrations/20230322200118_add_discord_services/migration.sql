-- CreateTable
CREATE TABLE "DiscordServiceMessageRecord" (
    "messageId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelid" TEXT NOT NULL,
    "senderDiscordId" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "DiscordServiceMessageRecord_pkey" PRIMARY KEY ("messageId")
);
