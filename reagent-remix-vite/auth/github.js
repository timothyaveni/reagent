import { prisma } from '../db/db.js';

import { attachUnattachedInvitesForGithubUsername } from './invites.js';
import { createUser } from './user.js';

// type GitHubAuthProfile = {
//   id: string;
// };

export const resolveGitHubAuth = async (profile) => {
  const { id } = await resolveGitHubAuthInner(profile);

  await attachUnattachedInvitesForGithubUsername(id, profile.username);

  return {
    id,
  };
};

export const resolveGitHubAuthInner = async (profile) => {
  const ghAuthRow = await prisma.gitHubAuth.findUnique({
    where: {
      githubId: profile.id,
    },
    select: {
      userId: true,
    },
  });

  // this isn't atomic -- i suppose we could try to create it and catch
  if (ghAuthRow) {
    return {
      id: ghAuthRow.userId,
    };
  }

  const newUser = await createUser();

  await prisma.gitHubAuth.create({
    data: {
      githubId: profile.id,
      userId: newUser.id,
    },
  });

  const name = profile.displayName || profile.username;

  if (name) {
    await prisma.userInfo.upsert({
      where: {
        userId: newUser.id,
      },
      update: {
        displayName: name,
      },
      create: {
        userId: newUser.id,
        displayName: name,
      },
    });
  }

  return {
    id: newUser.id,
  };
};
