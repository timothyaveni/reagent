import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const userGithubId = '109567149'; // lol TODO this is me

  const userWithGithubAuth = await prisma.user.findFirst({
    where: {
      githubAuth: {
        githubId: userGithubId,
      },
    },
  });

  if (userWithGithubAuth) {
    return;
  }

  const user = await prisma.user.create({
    data: {
      githubAuth: {
        create: {
          githubId: userGithubId,
        },
      },
    },
  });
}

export default main;
