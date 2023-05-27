-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "preferences" JSONB NOT NULL DEFAULT '{}';
