import { Pending } from '@mui/icons-material';
import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from '@remix-run/react';
import { SerializeFrom } from '@remix-run/server-runtime';
import { formatDistance } from 'date-fns';
import T from '~/i18n/T';
import { renderNogginRunStatus } from '../noggins.$identifier.use_.$runId/status';
import { NogginUseLoader } from './route';

type PastRunsProps = {
  runs: SerializeFrom<NogginUseLoader>['runs'];
};

function NoRuns() {
  return (
    // todo looks like NOT VERY GOOD
    <Stack spacing={1} alignItems={'center'}>
      <Pending htmlColor="#666" fontSize="large" />
      <Typography variant="body1" color="textSecondary">
        <T>
          Looks like this noggin has never been used! Try it with the form
          above.
        </T>
      </Typography>
    </Stack>
  );
}

function RunTable({ runs }: { runs: PastRunsProps['runs'] }) {
  const navigate = useNavigate();
  const { identifier } = useParams();

  return (
    <Box sx={{ mt: 2 }}>
      <Table>
        <TableHead
          sx={{
            '& th': {
              fontWeight: 'bold',
            },
          }}
        >
          <TableRow>
            <TableCell>
              <T>Run started</T>
            </TableCell>
            <TableCell>
              <T>Variables</T>
            </TableCell>
            <TableCell>
              <T>Status</T>
            </TableCell>
            <TableCell>
              <T>Credit cost</T>
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {runs.map((run) => {
            return (
              <TableRow key={run.uuid}>
                <TableCell>
                  <T flagged>
                    {formatDistance(new Date(run.createdAt), new Date(), {
                      addSuffix: true,
                    })}
                  </T>
                </TableCell>
                {/* TODO variables */}
                <TableCell></TableCell>
                <TableCell>{renderNogginRunStatus(run.status)}</TableCell>
                <TableCell>
                  {/* todo */}
                  {run.status === 'running' ? (
                    <T>{run.estimatedCost} (estimated)</T>
                  ) : (
                    <T>{run.computedCost}</T>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      navigate(`/noggins/${identifier}/use/${run.uuid}`);
                    }}
                  >
                    <T>View</T>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}

export default function PastRuns({ runs }: PastRunsProps) {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h2">Past runs</Typography>
      {runs.length === 0 ? <NoRuns /> : <RunTable runs={runs} />}
    </Box>
  );
}
