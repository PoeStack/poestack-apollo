-- CreateTable
CREATE TABLE "OneClickMessageHistory" (
    "messageId" TEXT NOT NULL,
    "poestackUserId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "rateLimitKey" TEXT NOT NULL,
    "rateLimitExpires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OneClickMessageHistory_pkey" PRIMARY KEY ("messageId")
);
