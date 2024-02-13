import { AppLoadContext } from '@remix-run/server-runtime';
import { prisma } from 'db/db';
import { authorizeNoggin } from './noggin.server';

const NOGGIN_RUN_PAGE_SIZE = 15;

export async function getNogginRuns(
  context: AppLoadContext,
  { nogginId }: { nogginId: number },
  offsetPage: number = 1,
) {
  await authorizeNoggin(context, {
    nogginId,
  });

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

export const getNogginTotalIncurredCost = async (
  context: AppLoadContext,
  {
    nogginId,
  }: // includeUnfinished = true, // TODO i guess
  {
    nogginId: number;
    // includeUnfinished?: boolean
  },
) => {
  await authorizeNoggin(context, {
    nogginId,
  });

  // let's just do this in sql
  // of course don't love that this doesn't track with status, but such is life
  const [{ totalCost }] = (await prisma.$queryRaw`
    select
      sum(coalesce("NogginRunCost"."computedCostQuastra", "NogginRunCost"."estimatedCostQuastra", 0)) as "totalCost"
    from "NogginRun"
    inner join "NogginRunCost" on "NogginRun"."id" = "NogginRunCost"."nogginRunId"
    where "NogginRun"."nogginRevisionId" in (
      select id from "NogginRevision" where "NogginRevision"."nogginId" = ${nogginId}
    )
  `) as { totalCost: number }[];

  // console.log('totalCost', totalCost, nogginId);

  // right, can't do this with queryRaw
  // ${
  //   includeUnfinished ? '' : 'and status != "pending" and status != "running"'
  // }

  return totalCost || 0;
};
