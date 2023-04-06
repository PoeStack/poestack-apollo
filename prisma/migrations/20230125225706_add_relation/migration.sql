-- AddForeignKey
ALTER TABLE "StashSnapshotProfile" ADD CONSTRAINT "StashSnapshotProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
