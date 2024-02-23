import { AppLoadContext } from '@remix-run/server-runtime';
import { prisma } from 'db/db';
import { requireUser } from '~/auth/auth.server';
import { OrganizationRole } from '~/shared/organization';
import { requireAtLeastUserOrganizationRole } from './organization.server';

export const getProviderPublicData = async (
  provider: string | null | undefined,
) => {
  if (!provider) {
    return null;
  }

  return await prisma.modelProvider.findUnique({
    where: {
      name: provider,
    },
    select: {
      id: true,
      name: true,
      friendlyName: true,
      models: {
        select: {
          name: true,
        },
      },
      credentialsSchema: true,
      credentialsSchemaVersion: true,
    },
  });
};

export const getProviderCredentialsForUser = async (
  context: AppLoadContext,
  {
    providerId,
    providerCredentialsSchemaVersion,
  }: {
    providerId: number;
    providerCredentialsSchemaVersion: number;
  },
) => {
  const user = requireUser(context);

  return await prisma.modelProviderPersonalCredentials.findUnique({
    where: {
      modelProviderId_userId_credentialsVersion: {
        modelProviderId: providerId,
        userId: user.id,
        credentialsVersion: providerCredentialsSchemaVersion,
      },
    },
    select: {
      credentials: true,
    },
  });
};

export const upsertProviderCredentialsForUser = async (
  context: AppLoadContext,
  {
    providerName,
    credentialsSchemaVersion,
    credentials,
  }: {
    providerName: string;
    credentialsSchemaVersion: number;
    credentials: Record<string, unknown>;
  },
) => {
  const user = requireUser(context);

  const { id: providerId } = await prisma.modelProvider.findUniqueOrThrow({
    where: {
      name: providerName,
    },
    select: {
      id: true,
    },
  });

  return await prisma.modelProviderPersonalCredentials.upsert({
    where: {
      modelProviderId_userId_credentialsVersion: {
        modelProviderId: providerId,
        userId: user.id,
        credentialsVersion: credentialsSchemaVersion,
      },
    },
    update: {
      credentials: credentials as any,
    },
    create: {
      modelProviderId: providerId,
      userId: user.id,
      credentialsVersion: credentialsSchemaVersion,
      credentials: credentials as any,
    },
  });
};

export const getProviderCredentialsForOrg = async (
  context: AppLoadContext,
  {
    providerId,
    providerCredentialsSchemaVersion,
    orgId,
  }: {
    providerId: number;
    providerCredentialsSchemaVersion: number;
    orgId: number;
  },
) => {
  await requireAtLeastUserOrganizationRole(context, {
    organizationId: orgId,
    role: OrganizationRole.OWNER,
  });

  return await prisma.modelProviderOrgCredentials.findUnique({
    where: {
      modelProviderId_organizationId_credentialsVersion: {
        modelProviderId: providerId,
        organizationId: orgId,
        credentialsVersion: providerCredentialsSchemaVersion,
      },
    },
    select: {
      credentials: true,
    },
  });
};

export const upsertProviderCredentialsForOrg = async (
  context: AppLoadContext,
  {
    providerName,
    credentialsSchemaVersion,
    credentials,
    orgId,
  }: {
    providerName: string;
    credentialsSchemaVersion: number;
    credentials: Record<string, unknown>;
    orgId: number;
  },
) => {
  await requireAtLeastUserOrganizationRole(context, {
    organizationId: orgId,
    role: OrganizationRole.OWNER,
  });

  const { id: providerId } = await prisma.modelProvider.findUniqueOrThrow({
    where: {
      name: providerName,
    },
    select: {
      id: true,
    },
  });

  return await prisma.modelProviderOrgCredentials.upsert({
    where: {
      modelProviderId_organizationId_credentialsVersion: {
        modelProviderId: providerId,
        organizationId: orgId,
        credentialsVersion: credentialsSchemaVersion,
      },
    },
    update: {
      credentials: credentials as any,
    },
    create: {
      modelProviderId: providerId,
      organizationId: orgId,
      credentialsVersion: credentialsSchemaVersion,
      credentials: credentials as any,
    },
  });
};
