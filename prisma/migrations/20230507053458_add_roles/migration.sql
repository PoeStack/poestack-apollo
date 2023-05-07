-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "roles" TEXT[] DEFAULT ARRAY[]::TEXT[];
