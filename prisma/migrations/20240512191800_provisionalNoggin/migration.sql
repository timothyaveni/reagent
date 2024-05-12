-- CreateTable
CREATE TABLE "ProvisionalNoggin" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "linkingCode" TEXT NOT NULL,
    "userInitiatorId" INTEGER NOT NULL,
    "createdNogginId" INTEGER,
    "title" TEXT NOT NULL,
    "userOwnerId" INTEGER,
    "teamOwnerId" INTEGER,
    "parentOrgId" INTEGER,
    "totalAllocatedCreditQuastra" BIGINT,

    CONSTRAINT "ProvisionalNoggin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProvisionalNoggin_linkingCode_key" ON "ProvisionalNoggin"("linkingCode");

-- CreateIndex
CREATE UNIQUE INDEX "ProvisionalNoggin_createdNogginId_key" ON "ProvisionalNoggin"("createdNogginId");

-- AddForeignKey
ALTER TABLE "ProvisionalNoggin" ADD CONSTRAINT "ProvisionalNoggin_userInitiatorId_fkey" FOREIGN KEY ("userInitiatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProvisionalNoggin" ADD CONSTRAINT "ProvisionalNoggin_createdNogginId_fkey" FOREIGN KEY ("createdNogginId") REFERENCES "Noggin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProvisionalNoggin" ADD CONSTRAINT "ProvisionalNoggin_userOwnerId_fkey" FOREIGN KEY ("userOwnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProvisionalNoggin" ADD CONSTRAINT "ProvisionalNoggin_teamOwnerId_fkey" FOREIGN KEY ("teamOwnerId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProvisionalNoggin" ADD CONSTRAINT "ProvisionalNoggin_parentOrgId_fkey" FOREIGN KEY ("parentOrgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

