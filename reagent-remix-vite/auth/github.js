import { prisma } from '../db/db.js';

import { createUser } from './user.js';

// type GitHubAuthProfile = {
//   id: string;
// };

export const resolveGitHubAuth = async (profile) => {
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

  return {
    id: newUser.id,
  };
};
