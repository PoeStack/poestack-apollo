-- CreateTable
CREATE TABLE "UserNotifications" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "body" TEXT NOT NULL,

    CONSTRAINT "UserNotifications_pkey" PRIMARY KEY ("id")
);
