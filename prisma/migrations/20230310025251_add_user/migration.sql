-- AddForeignKey
ALTER TABLE "StashSnapshotItemGroupSummary" ADD CONSTRAINT "StashSnapshotItemGroupSummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
