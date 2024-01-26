import { prisma } from 'db/db';

const NOGGIN_RUN_PAGE_SIZE = 15;

// todo when we have noggin authorization validation
export async function getNogginRuns_OMNISCIENT(
  // context: AppLoadContext,
  nogginId: number,
  offsetPage: number = 1,
) {
  const runs = await prisma.nogginRun
    .findMany({
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
        cost: {
          select: {
            estimatedCostQuastra: true,
            estimationMetadata: true,
            computedCostQuastra: true,
            computationMetadata: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (offsetPage - 1) * NOGGIN_RUN_PAGE_SIZE,
      take: NOGGIN_RUN_PAGE_SIZE,
    })
    .then((runs) => {
      // convert bigints on cost to number if present
      return runs.map((run) => {
        return {
          ...run,
          cost:
            run.cost === null
              ? null
              : {
                  ...run.cost,
                  estimatedCostQuastra:
                    run.cost.estimatedCostQuastra === null
                      ? null
                      : Number(run.cost.estimatedCostQuastra),
                  computedCostQuastra:
                    run.cost.computedCostQuastra === null
                      ? null
                      : Number(run.cost.computedCostQuastra),
                },
        };
      });
    });

  const runCount = await prisma.nogginRun.count({
    where: {
      nogginRevision: {
        nogginId,
      },
    },
  });

  return {
    runs,
    runCount,
    NOGGIN_RUN_PAGE_SIZE,
  };
}
