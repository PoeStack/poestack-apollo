-- CreateTable
CREATE TABLE "PassiveNodeOnCharacterSnapshot" (
    "snapshotId" TEXT NOT NULL,
    "passiveNodeHash" TEXT NOT NULL,
    "passiveTreeVersion" TEXT NOT NULL,

    CONSTRAINT "PassiveNodeOnCharacterSnapshot_pkey" PRIMARY KEY ("snapshotId","passiveNodeHash","passiveTreeVersion")
);

-- AddForeignKey
ALTER TABLE "PassiveNodeOnCharacterSnapshot" ADD CONSTRAINT "PassiveNodeOnCharacterSnapshot_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "CharacterSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PassiveNodeOnCharacterSnapshot" ADD CONSTRAINT "PassiveNodeOnCharacterSnapshot_passiveNodeHash_passiveTree_fkey" FOREIGN KEY ("passiveNodeHash", "passiveTreeVersion") REFERENCES "PoePassiveTreeNode"("hash", "passiveTreeVersion") ON DELETE RESTRICT ON UPDATE CASCADE;
