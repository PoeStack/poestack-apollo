-- CreateTable
CREATE TABLE "StashViewTabSummary" (
    "stashId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "updatedAtTimestamp" TIMESTAMP(3) NOT NULL,
    "summary" JSONB NOT NULL,

    CONSTRAINT "StashViewTabSummary_pkey" PRIMARY KEY ("stashId")
);
