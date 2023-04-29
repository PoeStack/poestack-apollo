/*
  Warnings:

  - The primary key for the `PoeLiveListing` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `PoeLiveListing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PoeLiveListing" DROP CONSTRAINT "PoeLiveListing_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "PoeLiveListing_pkey" PRIMARY KEY ("publicStashId", "itemGroupHashString");
