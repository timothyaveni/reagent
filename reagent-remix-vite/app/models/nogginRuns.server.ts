import { prisma } from 'db/db';

// todo when we have noggin authorization validation
export async function getNogginRuns_OMNISCIENT(
  // context: AppLoadContext,
  nogginId: number,
) {
  return await prisma.nogginRun
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
}
