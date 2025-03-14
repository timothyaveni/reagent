-- AlterTable
ALTER TABLE "OrganizationInvite" ADD COLUMN     "githubUsernameLower" TEXT;

-- CreateIndex
CREATE INDEX "OrganizationInvite_githubUsernameLower_idx" ON "OrganizationInvite"("githubUsernameLower");

