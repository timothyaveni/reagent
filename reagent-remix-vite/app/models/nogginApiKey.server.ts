import { AppLoadContext } from '@remix-run/server-runtime';
import crypto from 'crypto';
import { prisma } from 'db/db';
import { requireUser } from '~/auth/auth.server';

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';

export const createNogginAPIKeyString = () => {
  let apiKey = 'rg_v1_';

  for (let i = 0; i < 36; i++) {
    apiKey += ALPHABET[crypto.randomInt(36)];
  }

  apiKey += '_ngk';

  return apiKey;
};

export const createOrGetPrimaryUINogginAPIKey_OMNIPOTENT = async (
  context: AppLoadContext,
  nogginId: number,
): Promise<string> => {
  // todo we probably don't want this to be omnipotent but we haven't really written the per-noggin auth code yet. here we would enforce ownership
  const user = await requireUser(context);
  // todo rotate these out? idk

  const primaryUIKeyReagentUserId = user.id;

  return (
    await prisma.nogginAPIKey.upsert({
      where: {
        nogginId_primaryUIKeyReagentUserId: {
          nogginId,
          primaryUIKeyReagentUserId,
        },
      },
      update: {},
      create: {
        canCreateRun: true,
        canViewFullRunHistory: true,
        canViewRunResult: true,
        key: createNogginAPIKeyString(),
        nogginId,
        primaryUIKeyReagentUserId,
      },
    })
  ).key;
};
