-- CreateTable
CREATE TABLE "PoePublicStashUpdateRecord" (
    "publicStashId" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "poeProfileName" TEXT NOT NULL,
    "createdAtTimestamp" TIMESTAMP(3) NOT NULL,
    "updatedAtTimestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PoePublicStashUpdateRecord_pkey" PRIMARY KEY ("publicStashId","league")
);

-- CreateIndex
CREATE INDEX "PoePublicStashUpdateRecord_publicStashId_idx" ON "PoePublicStashUpdateRecord"("publicStashId");

-- CreateIndex
CREATE INDEX "PoePublicStashUpdateRecord_updatedAtTimestamp_idx" ON "PoePublicStashUpdateRecord"("updatedAtTimestamp");
