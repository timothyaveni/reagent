import { prisma } from 'db/db';

// todo when we have noggin authorization validation
export async function getNogginRuns_OMNISCIENT(
  // context: AppLoadContext,
  nogginId: number,
) {
  return await prisma.nogginRun.findMany({
    where: {
      nogginRevision: {
        nogginId,
      },
    },
    select: {
      uuid: true,
      createdAt: true,
      status: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}
