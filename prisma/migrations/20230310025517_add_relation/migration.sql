-- AddForeignKey
ALTER TABLE "CharacterSnapshotRecord" ADD CONSTRAINT "CharacterSnapshotRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtlasPassiveTreeSnapshot" ADD CONSTRAINT "AtlasPassiveTreeSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSnapshotSearchableSummary2" ADD CONSTRAINT "CharacterSnapshotSearchableSummary2_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
