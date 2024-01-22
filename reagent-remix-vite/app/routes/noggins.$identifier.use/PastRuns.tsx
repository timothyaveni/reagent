import { BlurOn } from '@mui/icons-material';
import {
  Box,
  Button,
  Paper,
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
import { unit } from 'reagent-noggin-shared/cost-calculation/units';
import T from '~/i18n/T';
import { renderNogginRunStatus } from '../noggins.$identifier.use_.$runUuid/status';
import { NogginUseLoader } from './route';

type PastRunsProps = {
  runs: SerializeFrom<NogginUseLoader>['runs'];
};

function NoRuns() {
  return (
    <Paper
      elevation={2}
      // don't take up the full width:
      sx={{
        width: 'fit-content',
        mx: 'auto',
        p: 3,
        mt: 2,
      }}
    >
      <Stack spacing={2} alignItems={'center'}>
        <BlurOn htmlColor="#666" fontSize="large" />
        <Typography variant="body1" color="textSecondary">
          <T>
            Looks like this noggin has never been used! Try it with the form
            above.
          </T>
        </Typography>
      </Stack>
    </Paper>
  );
}

function renderCost(cost: PastRunsProps['runs'][0]['cost']) {
  if (cost === null) {
    return null;
  }

  if (cost.computedCostQuastra !== null) {
    const creditCount = unit(cost.computedCostQuastra, 'quastra')
      .to('credits')
      .toNumber();
    // round for rendering
    const roundedCreditCount = Math.round(creditCount * 1000000) / 1000000;
    return (
      <T flagged>
        {roundedCreditCount} <T>credits</T>
      </T>
    );
  }

  if (cost.estimatedCostQuastra !== null) {
    const creditCount = unit(cost.estimatedCostQuastra, 'quastra')
      .to('credits')
      .toNumber();
    // round for rendering
    const roundedCreditCount = Math.round(creditCount * 1000000) / 1000000;
    return (
      <T flagged>
        {roundedCreditCount} <T>credits</T> (estimated)
      </T>
    );
  }

  return null;
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
                <TableCell>{renderCost(run.cost)}</TableCell>
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
