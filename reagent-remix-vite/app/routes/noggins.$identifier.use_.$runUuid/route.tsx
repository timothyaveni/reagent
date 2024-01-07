import { json } from '@remix-run/node';
import { useLoaderData, useParams } from '@remix-run/react';
import { prisma } from 'db/db';
import { useEffect, useState } from 'react';
import { createOrGetPrimaryUINogginAPIKey_OMNIPOTENT } from '~/models/nogginApiKey.server';
import { notFound } from '~/route-utils/status-code';

import { Alert, Breadcrumbs, Typography } from '@mui/material';
import { LoaderFunctionArgs, SerializeFrom } from '@remix-run/server-runtime';
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
      uuid: params.runUuid,
    },
    select: {
      nogginRevision: {
        select: {
          nogginId: true,
        },
      },
      id: true,
    },
  });

  if (!run) {
    throw notFound();
  }

  // todo: there shouldn't be more than one, but we won't check that for now
  const finalOutput = await prisma.nogginRunOutputEntry.findFirst({
    where: {
      runId: run.id,
      stage: 'final',
    },
    select: {
      content: true,
      contentType: true,
      metadata: true,
    },
  });

  const apiKey = await createOrGetPrimaryUINogginAPIKey_OMNIPOTENT(
    context,
    run.nogginRevision.nogginId,
  );

  return json({
    noggin,
    finalOutput,
    apiKey,
    NOGGIN_SERVER_EXTERNAL_WEBSOCKET_URL:
      process.env.NOGGIN_SERVER_EXTERNAL_WEBSOCKET_URL,
  });
};

type OutputState =
  | {
      outputStage: 'not started';
      outputType: 'unknown'; // we may use output type from the noggin in the future -- but it needs to be from the right revision
    }
  | {
      outputStage: 'partial';
      outputType: 'text';
      outputText: string;
    }
  | {
      outputStage: 'final';
      outputType: 'text';
      outputText: string;
      metadata?: any;
    }
  | {
      outputStage: 'final';
      outputType: 'asset';
      outputAssetURL: string;
      metadata?: any;
    }
  | {
      outputStage: 'final';
      outputType: 'error';
      outputError: string;
      metadata?: any;
    };

const getInitialOutputStateForOutput = (
  output: SerializeFrom<typeof loader>['finalOutput'],
): OutputState => {
  if (!output) {
    return {
      outputStage: 'not started',
      outputType: 'unknown',
    };
  }

  if (output.contentType === 'text') {
    return {
      outputStage: 'final',
      outputType: 'text',
      outputText: output.content,
      metadata: output.metadata,
    };
  } else if (output.contentType === 'assetUrl') {
    return {
      outputStage: 'final',
      outputType: 'asset',
      outputAssetURL: output.content,
      metadata: output.metadata,
    };
  } else if (output.contentType === 'error' || !output.contentType) {
    return {
      outputStage: 'final',
      outputType: 'error',
      outputError: output.content,
      metadata: output.metadata,
    };
  }

  const _exhaustiveCheck: never = output.contentType;
  return _exhaustiveCheck; // dunno why i need this
};

function RenderOutput({ outputState }: { outputState: OutputState }) {
  if (outputState.outputType === 'unknown') {
    return <></>;
  } else if (outputState.outputType === 'text') {
    return <>{outputState.outputText}</>;
  } else if (outputState.outputType === 'asset') {
    return <img src={outputState.outputAssetURL} alt="output asset" />;
  } else if (outputState.outputType === 'error') {
    return <Alert severity="error">{outputState.outputError}</Alert>;
  } else {
    const _exhaustiveCheck: never = outputState;
    return <>Unknown error</>;
  }
}

export default function NogginRun() {
  const { noggin, apiKey, finalOutput, NOGGIN_SERVER_EXTERNAL_WEBSOCKET_URL } =
    useLoaderData<typeof loader>();
  const params = useParams();

  const [currentOutputState, setCurrentOutputState] = useState<OutputState>(
    getInitialOutputStateForOutput(finalOutput),
  );

  useEffect(() => {
    if (finalOutput) {
      return;
    }

    const wsUrl = `${NOGGIN_SERVER_EXTERNAL_WEBSOCKET_URL}/ws/${params.runUuid}?key=${apiKey}`;

    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const obj = JSON.parse(event.data);
      console.log({ obj });
      if (obj.type === 'incremental text output') {
        setCurrentOutputState((prev) => {
          if (prev.outputStage === 'not started') {
            return {
              outputStage: 'partial',
              outputType: 'text',
              outputText: obj.text,
            };
          } else if (prev.outputStage === 'partial') {
            return {
              outputStage: 'partial',
              outputType: 'text',
              outputText: prev.outputText + obj.text,
            };
          } else {
            return prev;
          }
        });
      } else if (obj.type === 'final text output') {
        setCurrentOutputState({
          outputStage: 'final',
          outputType: 'text',
          outputText: obj.text,
          metadata: obj.metadata,
        });
      } else if (obj.type === 'final asset URL output') {
        setCurrentOutputState({
          outputStage: 'final',
          outputType: 'asset',
          outputAssetURL: obj.assetUrl,
          metadata: obj.metadata,
        });
      }
    };

    return () => {
      ws.close();
    };
  }, [params.runUuid, apiKey, finalOutput]);

  return (
    <>
      <Breadcrumbs>
        <MUILink to={`/noggins/${params.identifier}/use`} underline="hover">
          {noggin.title}
        </MUILink>
        <Typography color="text.primary">{params.runUuid}</Typography>
      </Breadcrumbs>
      <div className="noggin-run-text-output">
        <RenderOutput outputState={currentOutputState} />
      </div>
    </>
  );
}