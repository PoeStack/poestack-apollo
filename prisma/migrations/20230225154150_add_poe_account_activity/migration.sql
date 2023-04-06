-- CreateTable
CREATE TABLE "PoeAccountActivity" (
    "poeProfileName" TEXT NOT NULL,
    "createdAtTimestamp" TIMESTAMP(3) NOT NULL,
    "updatedAtTimestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PoeAccountActivity_pkey" PRIMARY KEY ("poeProfileName")
);

-- CreateIndex
CREATE UNIQUE INDEX "PoeAccountActivity_poeProfileName_key" ON "PoeAccountActivity"("poeProfileName");

-- CreateIndex
CREATE INDEX "PoeAccountActivity_poeProfileName_idx" ON "PoeAccountActivity"("poeProfileName");

-- CreateIndex
CREATE INDEX "PoeAccountActivity_createdAtTimestamp_idx" ON "PoeAccountActivity"("createdAtTimestamp");
