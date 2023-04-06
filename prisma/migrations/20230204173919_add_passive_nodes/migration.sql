-- CreateTable
CREATE TABLE "PoePassiveTreeNode" (
    "passiveTreeVersion" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "isNotable" BOOLEAN,
    "isKeystone" BOOLEAN,
    "isMastery" BOOLEAN,
    "isJewelSocket" BOOLEAN,
    "ascendancyName" TEXT,

    CONSTRAINT "PoePassiveTreeNode_pkey" PRIMARY KEY ("passiveTreeVersion","hash")
);
