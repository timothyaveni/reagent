import { AppLoadContext } from '@remix-run/server-runtime';
import { requireUser } from '~/auth/auth.server';
import prisma from '~/db';
import { createNogginYjsDoc, serializeYDoc } from './nogginRevision.server';

import {
  uniqueNamesGenerator,
  adjectives,
  animals,
  NumberDictionary,
} from 'unique-names-generator';

export const createNoggin = async (
  context: AppLoadContext,
  owner: {
    ownerType: 'user' | 'team';
    ownerId: number;
  },
) => {
  const user = await requireUser(context);

  if (owner.ownerType === 'user' && owner.ownerId !== user.id) {
    throw new Error('Cannot create noggin for another user');
  } else if (owner.ownerType === 'team') {
    // TODO
    throw new Error('Cannot create noggin for a team');
  }

  const yDoc = await createNogginYjsDoc();
  const buffer = serializeYDoc(yDoc);

  // there is a race condition of course but the database has a uniqueness constraint. user will live
  const slug = await generateFreeSlug();

  const noggin = await prisma.noggin.create({
    data: {
      slug,
      title: slug,
      ...(owner.ownerType === 'user'
        ? {
            userOwner: {
              connect: {
                id: owner.ownerId,
              },
            },
          }
        : {
            teamOwner: {
              connect: {
                id: owner.ownerId,
              },
            },
          }),
    },
  });

  await prisma.nogginRevision.create({
    data: {
      content: buffer,
      nogginId: noggin.id,
    },
  });

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
  const user = await requireUser(context);

  const noggin = await prisma.noggin.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      title: true,
    },
  });

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

  return noggins;
};
