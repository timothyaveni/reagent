import { json } from '@remix-run/node';
import { useLoaderData, useParams } from '@remix-run/react';
import { prisma } from 'db/db';
import { useEffect, useState } from 'react';
import { createOrGetPrimaryUINogginAPIKey_OMNIPOTENT } from '~/models/nogginApiKey.server';
import { notFound } from '~/route-utils/status-code';

import { Breadcrumbs, Typography } from '@mui/material';
import { LoaderFunctionArgs } from '@remix-run/server-runtime';
import MUILink from '~/components/MUILink';
import './NogginRun.css';

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  const noggin = await prisma.noggin.findUnique({
    where: {
      slug: params.identifier,
    },
  });

  if (!noggin) {
    throw notFound();
  }

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

  return json({ noggin, apiKey, NOGGIN_SERVER_EXTERNAL_WEBSOCKET_URL: process.env.NOGGIN_SERVER_EXTERNAL_WEBSOCKET_URL });
};

export default function NogginRun() {
  const { noggin, apiKey, NOGGIN_SERVER_EXTERNAL_WEBSOCKET_URL } = useLoaderData<typeof loader>();
  const params = useParams();

  const [outputText, setOutputText] = useState('');
  const [outputAssetURL, setOutputAssetURL] = useState('');

  useEffect(() => {
    const wsUrl = `${NOGGIN_SERVER_EXTERNAL_WEBSOCKET_URL}/ws/${params.runId}?key=${apiKey}`;

    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const obj = JSON.parse(event.data);
      console.log({ obj });
      if (obj.type === 'incremental output') {
        setOutputText((prev) => prev + obj.text);
      } else if (obj.type === 'final output text') {
        setOutputText(obj.text);
      } else if (obj.type === 'final output asset URL') {
        setOutputAssetURL(obj.assetUrl);
      }
    };

    return () => {
      ws.close();
    };
  }, [params.runId, apiKey]);

  return (
    <>
      <Breadcrumbs>
        <MUILink to={`/noggins/${params.identifier}/use`} underline="hover">
          {noggin.title}
        </MUILink>
        <Typography color="text.primary">{params.runId}</Typography>
      </Breadcrumbs>
      <div className="noggin-run-text-output">
        {outputAssetURL ? (
          <img src={outputAssetURL} alt="output asset" />
        ) : (
          outputText
        )}
      </div>
    </>
  );
}
