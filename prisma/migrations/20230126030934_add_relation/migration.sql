-- AddForeignKey
ALTER TABLE "StashSnapshot" ADD CONSTRAINT "StashSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
