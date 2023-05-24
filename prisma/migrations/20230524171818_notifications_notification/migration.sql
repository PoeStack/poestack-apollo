/*
  Warnings:

  - You are about to drop the `UserNotifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "UserNotifications";

-- CreateTable
CREATE TABLE "UserNotification" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "UserNotification_pkey" PRIMARY KEY ("id")
);
