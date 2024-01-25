import { BlurOn } from '@mui/icons-material';
import {
  Box,
  Button,
  Pagination,
  PaginationItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Link, useNavigate, useParams } from '@remix-run/react';
import { SerializeFrom } from '@remix-run/server-runtime';
import { formatDistance } from 'date-fns';
import { unit } from 'reagent-noggin-shared/cost-calculation/units';
import T from '~/i18n/T';
import { renderNogginRunStatus } from '../noggins.$identifier.use_.$runUuid/status';
import { NogginUseLoader } from './route';

type PastRunsProps = {
  nogginIdentifier: SerializeFrom<NogginUseLoader>['noggin']['slug'];
  page: SerializeFrom<NogginUseLoader>['page'];
  runs: SerializeFrom<NogginUseLoader>['runs'];
  runCount: SerializeFrom<NogginUseLoader>['runCount'];
  runPageSize: SerializeFrom<NogginUseLoader>['NOGGIN_RUN_PAGE_SIZE'];
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
          {/* this renders when the page is set too high. weird but nbd */}
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

export default function PastRuns({
  nogginIdentifier,
  runs,
  page,
  runCount,
  runPageSize,
}: PastRunsProps) {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h2">Past runs</Typography>
      {runCount === 0 ? <NoRuns /> : <RunTable runs={runs} />}
      {runCount > runPageSize ? (
        <Box display="flex" justifyContent="center" mt={2} mb={4}>
          {/* todo don't love how this forces a rerender even for the top stuff. maybe we should do it in the URL idk */}
          <Pagination
            page={page}
            count={Math.ceil(runCount / runPageSize)}
            renderItem={(item) => (
              <PaginationItem
                component={Link}
                to={`/noggins/${nogginIdentifier}/use/${
                  item.page === 1 ? '' : `?page=${item.page}`
                }`}
                preventScrollReset
                replace
                {...item}
              />
            )}
          />
        </Box>
      ) : null}
    </Box>
  );
}
