-- CreateTable
CREATE TABLE "PoeStatRange" (
    "statGroupHashString" TEXT NOT NULL,
    "max" DOUBLE PRECISION NOT NULL,
    "min" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PoeStatRange_pkey" PRIMARY KEY ("statGroupHashString")
);

-- CreateIndex
CREATE INDEX "PoeStatRange_statGroupHashString_idx" ON "PoeStatRange"("statGroupHashString");
