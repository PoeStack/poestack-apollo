-- AlterTable
ALTER TABLE "UserNotification" ADD COLUMN     "title" TEXT,
ALTER COLUMN "body" DROP NOT NULL;
