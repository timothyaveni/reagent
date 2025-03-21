import { json } from '@remix-run/node';
import { useLoaderData, useParams } from '@remix-run/react';
import { prisma } from 'db/db';
import { useEffect, useState } from 'react';
import { createOrGetPrimaryUINogginAPIKey_OMNIPOTENT } from '~/models/nogginApiKey.server';
import { notFound } from '~/route-utils/status-code';

import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import {
  LoaderFunctionArgs,
  ServerRuntimeMetaFunction as MetaFunction,
  SerializeFrom,
} from '@remix-run/server-runtime';
import { IOVisualizationRender } from 'reagent-noggin-shared/io-visualization-types/IOVisualizationRender';
import { LogEntry } from 'reagent-noggin-shared/log';
import MUILink from '~/components/MUILink';
import PreformattedText from '~/components/PreformattedText';
import T from '~/i18n/T';
import { loadNogginBySlug } from '~/models/noggin.server';
import './NogginRun.css';
import { ExecutionLog } from './execution-log/ExecutionLog.client';
import { IOVisualization } from './io-visualization/IOVisualization';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `Run of ${data?.noggin.title} :: reagent` },
    {
      name: 'description',
      content: `Run of ${data?.noggin.title}`,
    },
  ];
};

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  const noggin = await loadNogginBySlug(context, { slug: params.identifier });

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
      ioVisualizationRender: true,
    },
  });

  if (!run) {
    throw notFound();
  }

  // todo: there shouldn't be more than one, but we won't check that for now
  // also todo: put this in the model
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

  // todo: this goes in the model as well
  const logEntries = await prisma.nogginRunLogEntry.findMany({
    where: {
      runId: run.id,
    },
    select: {
      level: true,
      stage: true,
      message: true,
      timestamp: true,
    },
  });

  const apiKey = await createOrGetPrimaryUINogginAPIKey_OMNIPOTENT(
    context,
    run.nogginRevision.nogginId,
  );

  return json({
    noggin,
    ioVisualizationRender: run.ioVisualizationRender as IOVisualizationRender,
    logEntries,
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

function RenderOutput({
  outputState,
  hasIOVisualization,
}: {
  outputState: OutputState;
  hasIOVisualization: boolean;
}) {
  if (outputState.outputStage === 'not started') {
    if (hasIOVisualization) {
      return <CircularProgress size={30} sx={{ p: 2 }} />;
    } else {
      return null;
    }
  }

  // just render if we don't have an IO visualization ... but not the progress bar above

  if (outputState.outputType === 'text') {
    return outputState.outputText;
  } else if (outputState.outputType === 'asset') {
    return (
      <img
        src={outputState.outputAssetURL}
        alt="output asset"
        style={{
          maxWidth: 800,
          maxHeight: 800,
        }}
      />
    );
  } else if (outputState.outputType === 'error') {
    return (
      <>
        <Alert severity="error">{outputState.outputError}</Alert>
        {outputState.metadata ? (
          <PreformattedText>
            {JSON.stringify(outputState.metadata, null, 2)}
          </PreformattedText>
        ) : null}
      </>
    );
  } else {
    const _exhaustiveCheck: never = outputState;
    return <>Unknown error</>;
  }
}

export default function NogginRun() {
  const {
    noggin,
    apiKey,
    logEntries,
    finalOutput,
    ioVisualizationRender,
    NOGGIN_SERVER_EXTERNAL_WEBSOCKET_URL,
  } = useLoaderData<typeof loader>();
  const params = useParams();

  const [currentOutputState, setCurrentOutputState] = useState<OutputState>(
    getInitialOutputStateForOutput(finalOutput),
  );
  const [currentIOVisualizationRender, setCurrentIOVisualizationRender] =
    useState<IOVisualizationRender>(ioVisualizationRender);
  const [currentWebsocketLogEntries, setCurrentWebsocketLogEntries] = useState<
    typeof logEntries
  >([]);

  const [showingLog, setShowingLog] = useState(false);

  useEffect(() => {
    // maybe won't keep this default. log is a client component because error boundaries are trash
    // so even if we want it to default on we have to do it after mounting
    setShowingLog(true);
  }, []);

  useEffect(() => {
    if (finalOutput) {
      return;
    }

    const wsUrl = `${NOGGIN_SERVER_EXTERNAL_WEBSOCKET_URL}/ws/${params.runUuid}?key=${apiKey}`;

    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const obj = JSON.parse(event.data);
      console.log({ obj });
      if (obj.type === 'set io visualization') {
        setCurrentIOVisualizationRender(obj.ioVisualization);
      } else if (obj.type === 'incremental text output') {
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
      } else if (obj.type === 'error') {
        setCurrentOutputState({
          outputStage: 'final',
          outputType: 'error',
          outputError: obj.error,
          metadata: obj.metadata,
        });
      } else if (obj.type === 'log') {
        // todo, don't love that it's quadratic
        setCurrentWebsocketLogEntries((prev) => [...prev, obj.logEvent]);
      }
    };

    return () => {
      ws.close();
    };
  }, [params.runUuid, apiKey, finalOutput]);

  // if the websocket connects at _all_, it will start by dumping an entire incremental state
  // up to this point. so we should _swap out_ the log calls from the page load.
  const renderedLogEntries: LogEntry[] = currentWebsocketLogEntries.length
    ? (currentWebsocketLogEntries as LogEntry[])
    : (logEntries as LogEntry[]);

  return (
    <>
      <Breadcrumbs>
        <MUILink to={`/noggins/${params.identifier}/use`} underline="hover">
          {noggin.title}
        </MUILink>
        <Typography color="text.primary">{params.runUuid}</Typography>
      </Breadcrumbs>
      <Box sx={{ mt: 2, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
        <IOVisualization ioVisualizationRender={currentIOVisualizationRender}>
          <RenderOutput
            outputState={currentOutputState}
            hasIOVisualization={currentIOVisualizationRender !== null}
          />
        </IOVisualization>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignContent="center"
        >
          <Stack direction="row" spacing={3}>
            <Typography variant="h2">Logs</Typography>
            <Chip label={renderedLogEntries.length} />
          </Stack>
          <Button onClick={() => setShowingLog((prev) => !prev)}>
            {showingLog ? <T>Hide Logs</T> : <T>Show Logs</T>}
          </Button>
        </Stack>
        {showingLog ? (
          <Box sx={{ mt: 2 }}>
            <ExecutionLog logEntries={renderedLogEntries} />
          </Box>
        ) : null}
      </Box>
    </>
  );
}
