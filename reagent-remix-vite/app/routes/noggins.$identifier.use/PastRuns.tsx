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
  styled,
} from '@mui/material';
import { Link, useNavigate, useParams } from '@remix-run/react';
import { SerializeFrom } from '@remix-run/server-runtime';
import { formatDistance } from 'date-fns';
import { CostText } from '~/components/CostText';
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
    return <CostText quastra={cost.computedCostQuastra} />;
  }

  if (cost.estimatedCostQuastra !== null) {
    return (
      <>
        <CostText quastra={cost.estimatedCostQuastra} />{' '}
        <T flagged>(estimated)</T>
      </>
    );
  }

  return null;
}

const Image = styled('img')();

const trunc = (s: string, n: number) =>
  s.length > n ? s.substr(0, n - 1) + '...' : s;

function renderVariable(variable: any) {
  switch (variable.variableType) {
    case 'text':
      return (
        <Typography fontSize="small" title={variable.variableValue.text}>
          {trunc(variable.variableValue.text, 20)}
        </Typography>
      );
    case 'number':
      return (
        <Typography fontSize="small" title={variable.variableValue.number}>
          {trunc(variable.variableValue.number, 20)}
        </Typography>
      );
    case 'integer':
      return (
        <Typography fontSize="small" title={variable.variableValue.integer}>
          {trunc(variable.variableValue.integer, 20)}
        </Typography>
      );
    case 'image':
      return (
        <Image
          // src={variable.variableValue.url}
          src={'https://via.placeholder.com/150'}
          sx={{
            maxWidth: '32px',
            maxHeight: '32px',
            objectFit: 'contain',
          }}
        />
      );
    default:
      return null;
  }
}

function renderEvaluatedVariables(
  evaluatedParameters: PastRunsProps['runs'][0]['evaluatedParameters'],
) {
  if (evaluatedParameters === null) {
    return null;
  }

  return (
    <Stack spacing={0.5}>
      {Object.values(evaluatedParameters)
        .slice(0, 3)
        .map((v: any) => {
          return (
            <Stack
              direction="row"
              key={v.variableName}
              alignItems="center"
              spacing={2}
            >
              <Box>
                <strong>{v.variableName}</strong>:
              </Box>
              <Box>{renderVariable(v)}</Box>
            </Stack>
          );
        })}
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
                <TableCell>
                  {renderEvaluatedVariables(run.evaluatedParameters)}
                </TableCell>
                <TableCell>{renderNogginRunStatus(run.status)}</TableCell>
                <TableCell>{renderCost(run.cost)}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    href={`/noggins/${identifier}/use/${run.uuid}`}
                    onClick={(e) => {
                      e.preventDefault();
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
