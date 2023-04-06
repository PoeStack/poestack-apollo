-- AddForeignKey
ALTER TABLE "StashSnapshot" ADD CONSTRAINT "StashSnapshot_snapshotProfileId_fkey" FOREIGN KEY ("snapshotProfileId") REFERENCES "StashSnapshotProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
