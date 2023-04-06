-- CreateTable
CREATE TABLE "PoeCharacter" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PoeCharacter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterSnapshot" (
    "characterId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "expereince" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "CharacterSnapshot_pkey" PRIMARY KEY ("characterId","timestamp")
);

-- AddForeignKey
ALTER TABLE "PoeCharacter" ADD CONSTRAINT "PoeCharacter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSnapshot" ADD CONSTRAINT "CharacterSnapshot_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "PoeCharacter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
