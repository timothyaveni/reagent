import { AppLoadContext } from '@remix-run/server-runtime';
import { prisma } from 'db/db';
import { getNogginTotalIncurredCost_OMNISCIENT } from 'reagent-noggin-shared/cost-calculation/get-noggin-total-incurred-cost';
import { authorizeNoggin, loadNogginBySlug } from './noggin.server';
import { notFound } from '~/route-utils/status-code';
import { stringify } from 'csv-stringify';

const NOGGIN_RUN_PAGE_SIZE = 15;

export async function getNogginRuns(
  context: AppLoadContext,
  { nogginId }: { nogginId: number },
  offsetPage: number = 1,
  pageSize: number = NOGGIN_RUN_PAGE_SIZE,
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
        evaluatedParameters: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (offsetPage - 1) * pageSize,
      take: pageSize,
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
    pageSize,
  };
}

export const getNogginTotalIncurredCostQuastra = async (
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

  return Number(
    await getNogginTotalIncurredCost_OMNISCIENT(prisma, { nogginId }),
  );
};

export const getNogginTotalAllocatedCreditQuastra = async (
  context: AppLoadContext,
  {
    nogginId,
  }: {
    nogginId: number;
  },
): Promise<number | null> => {
  await authorizeNoggin(context, {
    nogginId,
  });

  const { totalAllocatedCreditQuastra } = (await prisma.noggin.findFirst({
    where: {
      id: nogginId,
    },
    select: {
      totalAllocatedCreditQuastra: true,
    },
  })) || { totalAllocatedCreditQuastra: null };

  if (totalAllocatedCreditQuastra === null) {
    return null;
  }

  return Number(totalAllocatedCreditQuastra);
};

const MAX_EXPORTABLE_RUNS = 1000; // Arbitrary limit to prevent excessive load

export const exportNogginRuns = async (
  context: AppLoadContext,
  { slug }: { slug: string },
): Promise<string> => {
  const noggin = await loadNogginBySlug(context, { slug });
  if (!noggin) {
    throw notFound();
  }

  const runCount = await prisma.nogginRun.count({
    where: {
      nogginRevision: {
        nogginId: noggin.id,
      },
    },
  });

  if (runCount > MAX_EXPORTABLE_RUNS) {
    throw new Error(
      `Cannot export more than ${MAX_EXPORTABLE_RUNS} runs at once.`,
    );
  }

  const runs = await prisma.nogginRun.findMany({
    where: {
      nogginRevision: {
        nogginId: noggin.id,
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
      evaluatedParameters: true,
      ioVisualizationRender: true,
      nogginOutputAssetObject: {
        select: {
          url: true,
        },
      },
      nogginRunOutputEntry: {
        where: {
          stage: 'final',
        },
        select: {
          content: true,
          contentType: true,
        },
        take: 1,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const csvData = runs.map((run) => ({
    url: `${process.env.REAGENT_EXTERNAL_URL}/noggins/${slug}/use/${run.uuid}`,
    uuid: run.uuid,
    createdAt: run.createdAt.toISOString(),
    status: run.status,
    updatedAt: run.updatedAt.toISOString(),
    estimatedCostQuastra:
      run.cost?.estimatedCostQuastra !== null
        ? Number(run.cost?.estimatedCostQuastra)
        : null,
    computedCostQuastra:
      run.cost?.computedCostQuastra !== null
        ? Number(run.cost?.computedCostQuastra)
        : null,
    evaluatedParameters: JSON.stringify(run.evaluatedParameters),
    ioVisualizationRender: run.ioVisualizationRender,
    outputAssetUrl:
      run.nogginOutputAssetObject?.map((asset) => asset.url).join(', ') || null,
    finalOutputContent: run.nogginRunOutputEntry[0]?.content || null,
    finalOutputContentType: run.nogginRunOutputEntry[0]?.contentType || null,
  }));

  const csvString = await new Promise<string>((resolve, reject) => {
    stringify(
      csvData,
      {
        header: true,
        columns: {
          url: 'URL',
          uuid: 'UUID',
          createdAt: 'Created At',
          status: 'Status',
          updatedAt: 'Updated At',
          estimatedCostQuastra: 'Estimated Cost (Quastra)',
          computedCostQuastra: 'Computed Cost (Quastra)',
          evaluatedParameters: 'Evaluated Parameters',
          ioVisualizationRender: 'IO Visualization Render',
          outputAssetUrl: 'Output Asset URL',
          finalOutputContent: 'Final Output Content',
          finalOutputContentType: 'Final Output Content Type',
        },
      },
      (err, output) => {
        if (err) {
          reject(err);
        } else {
          resolve(output);
        }
      },
    );
  });

  return csvString;
};
