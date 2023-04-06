-- CreateTable
CREATE TABLE "CharacterSnapshotPobStats" (
    "snapshotId" TEXT NOT NULL,
    "accuracy" INTEGER,
    "armour" INTEGER,
    "blockChance" INTEGER,
    "spellBlockChance" INTEGER,
    "chaosResist" INTEGER,
    "coldResist" INTEGER,
    "dex" INTEGER,
    "energyShield" INTEGER,
    "fireResist" INTEGER,
    "int" INTEGER,
    "life" INTEGER,
    "lightningResist" INTEGER,
    "mana" INTEGER,
    "str" INTEGER,
    "evasion" INTEGER,

    CONSTRAINT "CharacterSnapshotPobStats_pkey" PRIMARY KEY ("snapshotId")
);

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSnapshotPobStats_snapshotId_key" ON "CharacterSnapshotPobStats"("snapshotId");

-- AddForeignKey
ALTER TABLE "CharacterSnapshotPobStats" ADD CONSTRAINT "CharacterSnapshotPobStats_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "CharacterSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
