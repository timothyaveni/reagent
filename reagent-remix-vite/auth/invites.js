import { prisma } from '../db/db.js';

export const attachUnattachedInvitesForGithubUsername = async (
  userId,
  githubUsername,
) => {
  const invites = await prisma.organizationInvite.findMany({
    where: {
      githubUsernameLower: githubUsername.toLowerCase(),
      attachedUserId: null,
    },
  });

  for (const invite of invites) {
    await prisma.organizationInvite.update({
      where: {
        id: invite.id,
      },
      data: {
        attachedUserId: userId,
      },
    });
  }
};
