import { UserInfo } from '@prisma/client';
import { AppLoadContext } from '@remix-run/server-runtime';
import { prisma } from 'db/db';
import { requireUser } from '~/auth/auth.server';

export const getUserInfo = async (
  context: AppLoadContext,
): Promise<UserInfo | null> => {
  const user = requireUser(context);

  const userInfo = await prisma.userInfo.findFirst({
    where: { id: user.id },
  });

  if (!userInfo) {
    return null;
  }

  return userInfo;
};

export const setDisplayName = async (
  context: AppLoadContext,
  displayName: string,
): Promise<UserInfo> => {
  const user = requireUser(context);

  const userInfo = await prisma.userInfo.upsert({
    where: { id: user.id },
    create: {
      userId: user.id,
      displayName,
    },
    update: { displayName },
  });

  return userInfo;
};
