-- CreateTable
CREATE TABLE "CustomLadderGroup" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "memberUserIds" TEXT[],
    "createdAtTimestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomLadderGroup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CustomLadderGroup" ADD CONSTRAINT "CustomLadderGroup_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "UserProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
