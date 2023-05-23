-- CreateTable
CREATE TABLE "PoeLiveProfileActivityRecord" (
    "poeProfileName" TEXT NOT NULL,
    "lastActiveTimestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PoeLiveProfileActivityRecord_pkey" PRIMARY KEY ("poeProfileName")
);
