import { AppLoadContext } from '@remix-run/server-runtime';
import { prisma } from 'db/db';
import { requireUser } from '~/auth/auth.server';

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
