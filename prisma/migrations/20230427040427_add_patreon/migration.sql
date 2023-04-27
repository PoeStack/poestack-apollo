-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "patreonTier" TEXT,
ADD COLUMN     "patreonUpdatedAtTimestamp" TIMESTAMP(3),
ADD COLUMN     "patreonUserId" TEXT;
