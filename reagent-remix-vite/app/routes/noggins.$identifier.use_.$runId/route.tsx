import { json } from '@remix-run/node';
import { useLoaderData, useParams } from '@remix-run/react';
import { prisma } from 'db/db';
import { useEffect, useState } from 'react';
import { createOrGetPrimaryUINogginAPIKey_OMNIPOTENT } from '~/models/nogginApiKey.server';
import { notFound } from '~/route-utils/status-code';

import { LoaderFunctionArgs } from '@remix-run/server-runtime';
import './NogginRun.css';

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  // TODO important make sure they own this noggin lol
  // i mean, we're going to fix the key function right
  // TODO also this should be in a model file..
  const run = await prisma.nogginRun.findUnique({
    where: {
      uuid: params.runId,
    },
    select: {
      nogginRevision: {
        select: {
          nogginId: true,
        },
      },
    },
  });

  if (!run) {
    throw notFound();
  }

  const apiKey = await createOrGetPrimaryUINogginAPIKey_OMNIPOTENT(
    context,
    run.nogginRevision.nogginId,
  );

  return json({ apiKey });
};

export default function NogginRun() {
  const { apiKey } = useLoaderData<typeof loader>();
  const params = useParams();

  const [outputText, setOutputText] = useState('');

  useEffect(() => {
    // ws url:
    // TODO env
    const wsUrl = `ws://localhost:2358/ws/${params.runId}?key=${apiKey}`;

    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const obj = JSON.parse(event.data);
      if (obj.type === 'incremental output') {
        setOutputText((prev) => prev + obj.text);
      } else if (obj.type === 'final output') {
        setOutputText(obj.text);
      }
    };

    return () => {
      ws.close();
    };
  }, [params.runId, apiKey]);

  return <div className="noggin-run-text-output">{outputText}</div>;
}
