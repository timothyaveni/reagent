import { Alert, Box, Chip, Stack, Typography } from '@mui/material';
import { ErrorBoundary } from 'react-error-boundary';
import { LogEntry } from 'reagent-noggin-shared/log';
import { CostText } from '~/components/CostText';
import T, { pluralize } from '~/i18n/T';

const SEVERITY_MAP = {
  debug: 'info' as 'info',
  info: 'info' as 'info',
  warn: 'warning' as 'warning',
  error: 'error' as 'error',
};

function KeyReceivedLogEntry({ logEntry }: { logEntry: LogEntry }) {
  // we could share types here, but it's going to be a pain if we make changes
  // in the future... for now let's just do it all dynamically
  const message = logEntry.message as unknown as {
    type: 'key_received';
    text: string;
  };

  return message.text;
}

function ModelInfoLoadedLogEntry({ logEntry }: { logEntry: LogEntry }) {
  const message = logEntry.message as unknown as {
    type: 'model_info_loaded';
    text: string;
    modelName: string;
    revision: string;
    modelProviderName: string;
  };

  return (
    <>
      Using model: {message.modelProviderName}/
      <strong>{message.modelName}</strong> (revision {message.revision})
    </>
  );
}

function AnticipateCostLogEntry({ logEntry }: { logEntry: LogEntry }) {
  const message = logEntry.message as unknown as {
    type: 'anticipate_cost';
    estimatedCostQuastra: number;
    estimationMetadata: any;
  };

  return (
    <>
      Looks like this will cost around{' '}
      <CostText quastra={message.estimatedCostQuastra} />
    </>
  );
}

function CalculateCostLogEntry({ logEntry }: { logEntry: LogEntry }) {
  const message = logEntry.message as unknown as {
    type: 'compute_cost';
    computedCostQuastra: number;
    computationMetadata: any;
  };

  return (
    <>
      Final calculated cost: <CostText quastra={message.computedCostQuastra} />
    </>
  );
}

function ModelFullOutputLogEntry({ logEntry }: { logEntry: LogEntry }) {
  const message = logEntry.message as unknown as {
    type: 'model_full_output';
  };

  return <>Model output finished</>;
}

function LogLineInner({ logEntry }: { logEntry: LogEntry }) {
  switch (logEntry.message.type) {
    case 'key_received':
      return <KeyReceivedLogEntry logEntry={logEntry} />;
    case 'model_info_loaded':
      return <ModelInfoLoadedLogEntry logEntry={logEntry} />;
    case 'anticipate_cost':
      return <AnticipateCostLogEntry logEntry={logEntry} />;
    case 'calculate_cost':
      return <CalculateCostLogEntry logEntry={logEntry} />;
    case 'model_full_output':
      return <ModelFullOutputLogEntry logEntry={logEntry} />;
  }

  // might as well throw, because we have the boundary. the point of the boundary
  // is to handle the 'undefined's if weird stuff got logged that doesn't jive with
  // what we were expecting to render
  throw new Error(`Unknown log entry type: ${logEntry.message.type}`);
}

function LogLine({ logEntry }: { logEntry: LogEntry }) {
  const date = new Date(logEntry.timestamp || 0);
  const datetimeString = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

  return (
    <Box>
      <Alert
        severity={SEVERITY_MAP[logEntry.level]}
        // action={
        // <Button color="inherit" size="small">
        //   UNDO
        // </Button>
        // }
      >
        <ErrorBoundary
          // TODO not sure we can SSR the error boundary...
          fallback={
            <>
              {logEntry.level}: {JSON.stringify(logEntry.message)}
            </>
          }
          onError={(error, info) => {
            // console.error(error, info);
          }}
        >
          {logEntry.timestamp ? (
            <Chip label={datetimeString} size="small" sx={{ mr: 2 }} />
          ) : null}
          <LogLineInner logEntry={logEntry} />
        </ErrorBoundary>
      </Alert>
    </Box>
  );
}

export function ExecutionLog({ logEntries }: { logEntries: LogEntry[] }) {
  const debugMessagesCount = logEntries.filter(
    (e) => e.level === 'debug',
  ).length;

  return (
    <Box>
      <Typography variant="body2" color="textSecondary" mb={3}>
        <T flagged>
          {debugMessagesCount} debug-level{' '}
          {pluralize(debugMessagesCount, 'message', 'messages')} hidden
        </T>
      </Typography>
      <Stack spacing={1}>
        {logEntries
          .filter((e) => e.level !== 'debug') // TODO
          .map((logEntry, i) => {
            return <LogLine key={i} logEntry={logEntry} />;
          })}
      </Stack>
    </Box>
  );
}
