import { AppLoadContext } from '@remix-run/server-runtime';
import { prisma } from 'db/db';
import { requireUser } from '~/auth/auth.server';

export const getProviderPublicData = async (provider: string) => {
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
