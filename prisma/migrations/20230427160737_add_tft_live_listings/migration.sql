-- CreateTable
CREATE TABLE "TftLiveListing" (
    "id" TEXT NOT NULL,
    "userDiscordId" TEXT NOT NULL,
    "listedAtTimestamp" TIMESTAMP(3) NOT NULL,
    "updatedAtTimestamp" TIMESTAMP(3) NOT NULL,
    "tag" TEXT NOT NULL,
    "properties" JSONB NOT NULL,
    "delistedAtTimestamp" TIMESTAMP(3),

    CONSTRAINT "TftLiveListing_pkey" PRIMARY KEY ("id")
);
