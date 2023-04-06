-- DropForeignKey
ALTER TABLE "PassiveNodeOnCharacterSnapshot" DROP CONSTRAINT "PassiveNodeOnCharacterSnapshot_passiveNodeHash_passiveTree_fkey";

-- DropForeignKey
ALTER TABLE "PassiveNodeOnCharacterSnapshot" DROP CONSTRAINT "PassiveNodeOnCharacterSnapshot_snapshotId_fkey";

-- AddForeignKey
ALTER TABLE "PassiveNodeOnCharacterSnapshot" ADD CONSTRAINT "PassiveNodeOnCharacterSnapshot_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "CharacterSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PassiveNodeOnCharacterSnapshot" ADD CONSTRAINT "PassiveNodeOnCharacterSnapshot_passiveNodeHash_passiveTree_fkey" FOREIGN KEY ("passiveNodeHash", "passiveTreeVersion") REFERENCES "PoePassiveTreeNode"("hash", "passiveTreeVersion") ON DELETE CASCADE ON UPDATE CASCADE;
