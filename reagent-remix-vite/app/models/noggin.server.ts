import { AppLoadContext } from '@remix-run/server-runtime';
import { requireUser } from '~/auth/auth.server';
import prisma from '~/db';
import { createInitialRevisionForNoggin_OMNIPOTENT } from './nogginRevision.server';

import { EditorSchema } from 'reagent-noggin-shared/types/editorSchema';
import {
  NumberDictionary,
  adjectives,
  animals,
  uniqueNamesGenerator,
} from 'unique-names-generator';
import { notFound } from '~/route-utils/status-code';

export const createNoggin = async (
  context: AppLoadContext,
  nogginData: {
    ownerType: 'user' | 'team';
    ownerId: number;
    aiModelId: number;
    name: string;
  },
) => {
  const user = await requireUser(context);

  if (nogginData.ownerType === 'user' && nogginData.ownerId !== user.id) {
    throw new Error('Cannot create noggin for another user');
  } else if (nogginData.ownerType === 'team') {
    // TODO
    throw new Error('Cannot create noggin for a team');
  }

  // there is a race condition of course but the database has a uniqueness constraint. user will live
  const slug = await generateFreeSlug();

  // TODO: here is where we would authenticate that you're permitted to create a noggin with this model
  // (or that you/your org has an api key for this model)

  // console.log({
  //   data: {
  //     slug,
  //     title: nogginData.name || slug,
  //     aIModelId: nogginData.aiModelId,
  //     ...(nogginData.ownerType === 'user'
  //       ? {
  //           userOwnerId: nogginData.ownerId,
  //         }
  //       : {
  //           teamOwnerId: nogginData.ownerId,
  //         }),
  //   },
  // });

  const noggin = await prisma.noggin.create({
    data: {
      slug,
      title: nogginData.name || slug,
      aiModel: { connect: { id: nogginData.aiModelId } },
      ...(nogginData.ownerType === 'user'
        ? {
            userOwner: {
              connect: {
                id: nogginData.ownerId,
              },
            },
          }
        : {
            teamOwner: {
              connect: {
                id: nogginData.ownerId,
              },
            },
          }),
    },
  });

  await createInitialRevisionForNoggin_OMNIPOTENT(noggin.id);

  return noggin;
};

export const randomSlug = () => {
  const numberDictionary = NumberDictionary.generate({ min: 1000, max: 9999 });
  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals, numberDictionary],
    length: 3,
    separator: '-',
    style: 'lowerCase',
  });
};

export const generateFreeSlug = async () => {
  let tries = 0;
  while (tries < 10) {
    const slug = randomSlug();
    const noggin = await prisma.noggin.findUnique({
      where: {
        slug,
      },
    });

    if (!noggin) {
      return slug;
    }
  }

  throw new Error('Could not generate a free slug');
};

export const loadNogginBySlug = async (
  context: AppLoadContext,
  { slug }: { slug: string },
) => {
  requireUser(context);

  const noggin = await prisma.noggin.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      userOwnerId: true,
    },
  });

  if (!noggin) {
    throw notFound();
  }

  // temp
  if (noggin.userOwnerId !== context.user?.id) {
    throw notFound();
  }

  // TODO
  // show if:
  // - noggin is user-owned and this is that user (todo: merges)
  // - noggin is team-owned and this user is in that team
  // - noggin has a parent organization and the user is a manager or owner of that organization

  return noggin;
};

export const loadNogginsIndex = async (context: AppLoadContext) => {
  const user = await requireUser(context);

  // TODO: load for teams as well
  // TODO: limit
  const noggins = await prisma.noggin.findMany({
    where: {
      userOwnerId: user.id,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      nogginRevisions: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
        select: {
          id: true,
          updatedAt: true,
        },
      },
    },
  });

  // todo do this with sql (don't think prisma supports bleh)
  noggins.sort((a, b) => {
    if (!a.nogginRevisions[0]) {
      return 1;
    } else if (!b.nogginRevisions[0]) {
      return -1;
    } else {
      return +b.nogginRevisions[0].updatedAt > +a.nogginRevisions[0].updatedAt
        ? 1
        : -1;
    }
  });

  return noggins;
};

export const getNogginEditorSchema_OMNISCIENT = async (
  nogginId: number,
): Promise<EditorSchema> => {
  const noggin = await prisma.noggin.findUniqueOrThrow({
    where: {
      id: nogginId,
    },
    select: {
      aiModel: {
        select: {
          editorSchema: true,
        },
      },
    },
  });

  // console.log('noggin.aiModel.editorSchema', noggin.aiModel.editorSchema);

  return noggin.aiModel.editorSchema as unknown as EditorSchema;
};
