-- CreateEnum
CREATE TYPE "OrganizationMembershipRole" AS ENUM ('member', 'manager', 'owner');

-- CreateEnum
CREATE TYPE "OrganizationInviteStatus" AS ENUM ('pending', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "NogginRunLogLevel" AS ENUM ('debug', 'info', 'warn', 'error');

-- CreateEnum
CREATE TYPE "NogginRunLogEntryStage" AS ENUM ('request', 'authenticate', 'process_parameters', 'anticipate_cost', 'run_model', 'calculate_cost', 'postprocess', 'deliver', 'other');

-- CreateEnum
CREATE TYPE "NogginRunOutputEntryContentType" AS ENUM ('text', 'assetUrl', 'error');

-- CreateEnum
CREATE TYPE "NogginRunOutputEntryStage" AS ENUM ('incremental', 'final');

-- CreateEnum
CREATE TYPE "NogginRunStatus" AS ENUM ('pending', 'running', 'succeeded', 'failed');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInfo" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "displayName" TEXT,

    CONSTRAINT "UserInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitHubAuth" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "githubId" TEXT NOT NULL,

    CONSTRAINT "GitHubAuth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LTIv1p3Auth" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "ltiConnectionId" INTEGER NOT NULL,
    "ltiUserId" TEXT NOT NULL,

    CONSTRAINT "LTIv1p3Auth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LTIv1p3Connection" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "consumerKey" TEXT NOT NULL,
    "consumerSecret" TEXT NOT NULL,
    "lastSeenConsumerName" TEXT,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "LTIv1p3Connection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMerge" (
    "id" SERIAL NOT NULL,
    "user1Id" INTEGER NOT NULL,
    "user2Id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "UserMerge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RejectedMerge" (
    "id" SERIAL NOT NULL,
    "user1Id" INTEGER NOT NULL,
    "user2Id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RejectedMerge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMembership" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "organizationId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "OrganizationMembershipRole" NOT NULL,
    "totalPermittedSpendQuastra" BIGINT,

    CONSTRAINT "OrganizationMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationInvite" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "organizationId" INTEGER NOT NULL,
    "githubUsername" TEXT,
    "attachedUserId" INTEGER,
    "role" "OrganizationMembershipRole" NOT NULL,
    "initialBudgetQuastra" BIGINT,
    "inviteStatus" "OrganizationInviteStatus" NOT NULL,

    CONSTRAINT "OrganizationInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "totalPermittedSpendQuastra" BIGINT,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Noggin" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "userOwnerId" INTEGER,
    "teamOwnerId" INTEGER,
    "parentOrgId" INTEGER,
    "aiModelId" INTEGER NOT NULL,
    "totalAllocatedCreditQuastra" BIGINT,

    CONSTRAINT "Noggin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NogginRevision" (
    "id" SERIAL NOT NULL,
    "nogginId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "content" BYTEA NOT NULL,
    "nogginVariables" JSONB,
    "outputSchema" JSONB,

    CONSTRAINT "NogginRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NogginAPIKey" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "key" TEXT NOT NULL,
    "nogginId" INTEGER NOT NULL,
    "primaryUIKeyReagentUserId" INTEGER,
    "canViewRunResult" BOOLEAN NOT NULL,
    "canViewFullRunHistory" BOOLEAN NOT NULL,
    "canCreateRun" BOOLEAN NOT NULL,

    CONSTRAINT "NogginAPIKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NogginRun" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "nogginRevisionId" INTEGER NOT NULL,
    "status" "NogginRunStatus" NOT NULL,
    "evaluatedParameters" JSONB,
    "evaluatedOverrides" JSONB,
    "ioVisualizationRender" JSONB,

    CONSTRAINT "NogginRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NogginRunCost" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "nogginRunId" INTEGER NOT NULL,
    "estimatedCostQuastra" BIGINT,
    "estimationMetadata" JSONB,
    "computedCostQuastra" BIGINT,
    "computationMetadata" JSONB,

    CONSTRAINT "NogginRunCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NogginRunLogEntry" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "entryTypeVersion" INTEGER NOT NULL,
    "runId" INTEGER NOT NULL,
    "timestamp" BIGINT,
    "level" "NogginRunLogLevel" NOT NULL,
    "stage" "NogginRunLogEntryStage" NOT NULL,
    "message" JSONB NOT NULL,
    "privateData" JSONB,

    CONSTRAINT "NogginRunLogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NogginRunOutputEntry" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "entryTypeVersion" INTEGER NOT NULL,
    "runId" INTEGER NOT NULL,
    "contentType" "NogginRunOutputEntryContentType" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "stage" "NogginRunOutputEntryStage" NOT NULL,

    CONSTRAINT "NogginRunOutputEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelProvider" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "friendlyName" TEXT NOT NULL,
    "credentialsSchema" JSONB NOT NULL,
    "credentialsSchemaVersion" INTEGER NOT NULL,
    "needsCredentials" BOOLEAN NOT NULL,

    CONSTRAINT "ModelProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelProviderPersonalCredentials" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "modelProviderId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "credentials" JSONB NOT NULL,
    "credentialsVersion" INTEGER NOT NULL,

    CONSTRAINT "ModelProviderPersonalCredentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelProviderOrgCredentials" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "modelProviderId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "credentials" JSONB NOT NULL,
    "credentialsVersion" INTEGER NOT NULL,

    CONSTRAINT "ModelProviderOrgCredentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIModel" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "modelProviderId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "revision" TEXT NOT NULL,
    "editorSchema" JSONB NOT NULL,

    CONSTRAINT "AIModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NogginOutputAssetObject" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "nogginRunId" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "NogginOutputAssetObject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TeamToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_NogginRevisionToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AIModelToOrganization" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserInfo_userId_key" ON "UserInfo"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubAuth_userId_key" ON "GitHubAuth"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubAuth_githubId_key" ON "GitHubAuth"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "LTIv1p3Auth_userId_key" ON "LTIv1p3Auth"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LTIv1p3Auth_ltiConnectionId_ltiUserId_key" ON "LTIv1p3Auth"("ltiConnectionId", "ltiUserId");

-- CreateIndex
CREATE UNIQUE INDEX "LTIv1p3Connection_consumerKey_key" ON "LTIv1p3Connection"("consumerKey");

-- CreateIndex
CREATE UNIQUE INDEX "LTIv1p3Connection_organizationId_key" ON "LTIv1p3Connection"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationMembership_userId_idx" ON "OrganizationMembership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMembership_organizationId_userId_key" ON "OrganizationMembership"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "OrganizationInvite_githubUsername_idx" ON "OrganizationInvite"("githubUsername");

-- CreateIndex
CREATE INDEX "OrganizationInvite_attachedUserId_inviteStatus_idx" ON "OrganizationInvite"("attachedUserId", "inviteStatus");

-- CreateIndex
CREATE INDEX "OrganizationInvite_organizationId_inviteStatus_idx" ON "OrganizationInvite"("organizationId", "inviteStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Team_organizationId_name_key" ON "Team"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Noggin_slug_key" ON "Noggin"("slug");

-- CreateIndex
CREATE INDEX "Noggin_userOwnerId_idx" ON "Noggin"("userOwnerId");

-- CreateIndex
CREATE INDEX "Noggin_teamOwnerId_idx" ON "Noggin"("teamOwnerId");

-- CreateIndex
CREATE INDEX "NogginRevision_nogginId_idx" ON "NogginRevision"("nogginId");

-- CreateIndex
CREATE UNIQUE INDEX "NogginAPIKey_key_key" ON "NogginAPIKey"("key");

-- CreateIndex
CREATE UNIQUE INDEX "NogginAPIKey_nogginId_primaryUIKeyReagentUserId_key" ON "NogginAPIKey"("nogginId", "primaryUIKeyReagentUserId");

-- CreateIndex
CREATE UNIQUE INDEX "NogginRun_uuid_key" ON "NogginRun"("uuid");

-- CreateIndex
CREATE INDEX "NogginRun_nogginRevisionId_status_idx" ON "NogginRun"("nogginRevisionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "NogginRunCost_nogginRunId_key" ON "NogginRunCost"("nogginRunId");

-- CreateIndex
CREATE INDEX "NogginRunLogEntry_runId_stage_idx" ON "NogginRunLogEntry"("runId", "stage");

-- CreateIndex
CREATE INDEX "NogginRunOutputEntry_runId_stage_idx" ON "NogginRunOutputEntry"("runId", "stage");

-- CreateIndex
CREATE UNIQUE INDEX "ModelProvider_name_key" ON "ModelProvider"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ModelProviderPersonalCredentials_modelProviderId_userId_cre_key" ON "ModelProviderPersonalCredentials"("modelProviderId", "userId", "credentialsVersion");

-- CreateIndex
CREATE UNIQUE INDEX "ModelProviderOrgCredentials_modelProviderId_organizationId__key" ON "ModelProviderOrgCredentials"("modelProviderId", "organizationId", "credentialsVersion");

-- CreateIndex
CREATE UNIQUE INDEX "AIModel_modelProviderId_name_revision_key" ON "AIModel"("modelProviderId", "name", "revision");

-- CreateIndex
CREATE UNIQUE INDEX "NogginOutputAssetObject_uuid_key" ON "NogginOutputAssetObject"("uuid");

-- CreateIndex
CREATE INDEX "NogginOutputAssetObject_nogginRunId_idx" ON "NogginOutputAssetObject"("nogginRunId");

-- CreateIndex
CREATE UNIQUE INDEX "_TeamToUser_AB_unique" ON "_TeamToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_TeamToUser_B_index" ON "_TeamToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_NogginRevisionToUser_AB_unique" ON "_NogginRevisionToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_NogginRevisionToUser_B_index" ON "_NogginRevisionToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AIModelToOrganization_AB_unique" ON "_AIModelToOrganization"("A", "B");

-- CreateIndex
CREATE INDEX "_AIModelToOrganization_B_index" ON "_AIModelToOrganization"("B");

-- AddForeignKey
ALTER TABLE "UserInfo" ADD CONSTRAINT "UserInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitHubAuth" ADD CONSTRAINT "GitHubAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LTIv1p3Auth" ADD CONSTRAINT "LTIv1p3Auth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LTIv1p3Auth" ADD CONSTRAINT "LTIv1p3Auth_ltiConnectionId_fkey" FOREIGN KEY ("ltiConnectionId") REFERENCES "LTIv1p3Connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LTIv1p3Connection" ADD CONSTRAINT "LTIv1p3Connection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMerge" ADD CONSTRAINT "UserMerge_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMerge" ADD CONSTRAINT "UserMerge_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RejectedMerge" ADD CONSTRAINT "RejectedMerge_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RejectedMerge" ADD CONSTRAINT "RejectedMerge_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMembership" ADD CONSTRAINT "OrganizationMembership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMembership" ADD CONSTRAINT "OrganizationMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationInvite" ADD CONSTRAINT "OrganizationInvite_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationInvite" ADD CONSTRAINT "OrganizationInvite_attachedUserId_fkey" FOREIGN KEY ("attachedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Noggin" ADD CONSTRAINT "Noggin_userOwnerId_fkey" FOREIGN KEY ("userOwnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Noggin" ADD CONSTRAINT "Noggin_teamOwnerId_fkey" FOREIGN KEY ("teamOwnerId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Noggin" ADD CONSTRAINT "Noggin_parentOrgId_fkey" FOREIGN KEY ("parentOrgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Noggin" ADD CONSTRAINT "Noggin_aiModelId_fkey" FOREIGN KEY ("aiModelId") REFERENCES "AIModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NogginRevision" ADD CONSTRAINT "NogginRevision_nogginId_fkey" FOREIGN KEY ("nogginId") REFERENCES "Noggin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NogginAPIKey" ADD CONSTRAINT "NogginAPIKey_nogginId_fkey" FOREIGN KEY ("nogginId") REFERENCES "Noggin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NogginRun" ADD CONSTRAINT "NogginRun_nogginRevisionId_fkey" FOREIGN KEY ("nogginRevisionId") REFERENCES "NogginRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NogginRunCost" ADD CONSTRAINT "NogginRunCost_nogginRunId_fkey" FOREIGN KEY ("nogginRunId") REFERENCES "NogginRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NogginRunLogEntry" ADD CONSTRAINT "NogginRunLogEntry_runId_fkey" FOREIGN KEY ("runId") REFERENCES "NogginRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NogginRunOutputEntry" ADD CONSTRAINT "NogginRunOutputEntry_runId_fkey" FOREIGN KEY ("runId") REFERENCES "NogginRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelProviderPersonalCredentials" ADD CONSTRAINT "ModelProviderPersonalCredentials_modelProviderId_fkey" FOREIGN KEY ("modelProviderId") REFERENCES "ModelProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelProviderPersonalCredentials" ADD CONSTRAINT "ModelProviderPersonalCredentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelProviderOrgCredentials" ADD CONSTRAINT "ModelProviderOrgCredentials_modelProviderId_fkey" FOREIGN KEY ("modelProviderId") REFERENCES "ModelProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelProviderOrgCredentials" ADD CONSTRAINT "ModelProviderOrgCredentials_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIModel" ADD CONSTRAINT "AIModel_modelProviderId_fkey" FOREIGN KEY ("modelProviderId") REFERENCES "ModelProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NogginOutputAssetObject" ADD CONSTRAINT "NogginOutputAssetObject_nogginRunId_fkey" FOREIGN KEY ("nogginRunId") REFERENCES "NogginRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeamToUser" ADD CONSTRAINT "_TeamToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeamToUser" ADD CONSTRAINT "_TeamToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NogginRevisionToUser" ADD CONSTRAINT "_NogginRevisionToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "NogginRevision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NogginRevisionToUser" ADD CONSTRAINT "_NogginRevisionToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AIModelToOrganization" ADD CONSTRAINT "_AIModelToOrganization_A_fkey" FOREIGN KEY ("A") REFERENCES "AIModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AIModelToOrganization" ADD CONSTRAINT "_AIModelToOrganization_B_fkey" FOREIGN KEY ("B") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
