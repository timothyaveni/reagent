import { AppLoadContext } from '@remix-run/server-runtime';
import { prisma } from 'db/db';
import { requireUser } from '~/auth/auth.server';
import { notFound } from '~/route-utils/status-code.js';

export const indexAIModels = async (context: AppLoadContext) => {
  requireUser(context);
  const aiModels = await prisma.aIModel.findMany({
    select: {
      id: true,
      name: true,
      revision: true,
      modelProvider: {
        select: {
          name: true,
        },
      },
    },
  });

  return aiModels;
};

export const getAIModel_OMNISCIENT = async ({
  modelProviderName,
  modelName,
  revision,
}: {
  modelProviderName: string;
  modelName: string;
  revision: string;
}) => {
  const modelProvider = await prisma.modelProvider.findUnique({
    where: {
      name: modelProviderName,
    },
    select: {
      id: true,
    },
  });

  if (!modelProvider) {
    throw notFound();
  }

  const aiModel = await prisma.aIModel.findUnique({
    where: {
      modelProviderId_name_revision: {
        modelProviderId: modelProvider.id,
        name: modelName,
        revision,
      },
    },
  });

  if (!aiModel) {
    throw notFound();
  }

  return aiModel;
};
