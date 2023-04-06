-- AddForeignKey
ALTER TABLE "PublicStashListing" ADD CONSTRAINT "PublicStashListing_itemGroupHashString_fkey" FOREIGN KEY ("itemGroupHashString") REFERENCES "ItemGroup"("hashString") ON DELETE CASCADE ON UPDATE CASCADE;
