import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { prisma } from 'db/db';
import { notFound } from '~/route-utils/status-code';

export const loader = async ({ params, context }: any) => {
  const run = await prisma.nogginRun.findUnique({
    where: {
      uuid: params.runId,
    },
    select: {
      nogginRevision: {
        select: {
          noggin: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });

  if (!run) {
    throw notFound();
  }

  return json({ nogginTitle: run.nogginRevision.noggin.title });
};

export default function NogginRun(props: any) {
  const { nogginTitle } = useLoaderData<typeof loader>();
  return <strong>run for {nogginTitle}</strong>;
}
