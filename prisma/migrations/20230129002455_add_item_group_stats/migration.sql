/*
  Warnings:

  - A unique constraint covering the columns `[hashString]` on the table `ItemGroup` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "ItemGroupStats" (
    "hashString" TEXT NOT NULL,
    "updatedAtTimestamp" TIMESTAMP(3) NOT NULL,
    "totalListings" INTEGER NOT NULL,
    "totalValidListings" INTEGER NOT NULL,

    CONSTRAINT "ItemGroupStats_pkey" PRIMARY KEY ("hashString")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItemGroupStats_hashString_key" ON "ItemGroupStats"("hashString");

-- CreateIndex
CREATE UNIQUE INDEX "ItemGroup_hashString_key" ON "ItemGroup"("hashString");

-- AddForeignKey
ALTER TABLE "ItemGroupStats" ADD CONSTRAINT "ItemGroupStats_hashString_fkey" FOREIGN KEY ("hashString") REFERENCES "ItemGroup"("hashString") ON DELETE CASCADE ON UPDATE CASCADE;
