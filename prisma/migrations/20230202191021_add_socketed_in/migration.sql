-- AlterTable
ALTER TABLE "CharacterSnapshotItem" ADD COLUMN     "socketedInId" TEXT,
ALTER COLUMN "inventoryId" DROP NOT NULL;
