import { BlurOn } from '@mui/icons-material';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Pagination,
  PaginationItem,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Link, useMatches, useNavigate } from '@remix-run/react';
import { Jsonify } from '@remix-run/server-runtime/dist/jsonify';
import { ReactNode } from 'react';
import {
  NogginRevisionOutputSchema,
  NogginRevisionVariables,
} from 'reagent-noggin-shared/types/NogginRevision';
import T from '~/i18n/T';
import { loadNogginsIndex } from '~/models/noggin.server';
import NogginCardIOSchema from './NogginCardIOSchema';

function NogginCard({
  noggin,
}: {
  noggin: Jsonify<Awaited<ReturnType<typeof loadNogginsIndex>>[0]>;
}) {
  const navigate = useNavigate();

  return (
    <div className="noggin-card" key={noggin.slug}>
      <Card variant="outlined">
        <CardActionArea
          onClick={() => navigate(`/noggins/${noggin.slug}/edit`)}
        >
          <CardContent>
            <Stack
              direction={'row'}
              spacing={2}
              alignItems={'center'}
              justifyContent={'space-between'}
            >
              <Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="h2">{noggin.title}</Typography>
                  <Chip
                    label={<T flagged>{noggin.nonFailingRunCount} runs</T>}
                  />
                </Stack>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  component="p"
                  className="noggin-description"
                >
                  <T flagged>
                    {noggin.aiModel.modelProvider.name}/
                    <strong>{noggin.aiModel.name}</strong>
                  </T>
                </Typography>
                {noggin.parentOrg && (
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="p"
                    className="noggin-description"
                  >
                    {noggin.teamOwner ? (
                      <T flagged>
                        Within the team <strong>{noggin.teamOwner.name}</strong>{' '}
                        in the organization{' '}
                        <strong>{noggin.parentOrg.name}</strong>
                      </T>
                    ) : (
                      <T flagged>
                        Within the organization{' '}
                        <strong>{noggin.parentOrg.name}</strong>
                      </T>
                    )}
                  </Typography>
                )}
              </Stack>
              <NogginCardIOSchema
                variables={
                  noggin.nogginRevisions[0]
                    .nogginVariables as NogginRevisionVariables
                }
                outputSchema={
                  noggin.nogginRevisions[0]
                    .outputSchema as NogginRevisionOutputSchema
                }
              />
            </Stack>
          </CardContent>
        </CardActionArea>
      </Card>
    </div>
  );
}

export function NogginIndexBody({
  noggins,
  emptyMessage,
  page,
  pageCount,
  paginationParameter = 'page',
}: {
  noggins: Jsonify<Awaited<ReturnType<typeof loadNogginsIndex>>>;
  emptyMessage: ReactNode;
  page: number;
  pageCount: number;
  paginationParameter?: string;
}) {
  const routeMatches = useMatches();
  const lastRouteMatch = routeMatches[routeMatches.length - 1];
  const currentPathname = lastRouteMatch.pathname;

  if (noggins.length === 0) {
    return (
      <Box>
        <Paper
          elevation={2}
          // don't take up the full width:
          sx={{
            width: 'fit-content',
            mx: 'auto',
            p: 3,
          }}
        >
          <Stack spacing={2} alignItems={'center'}>
            <BlurOn htmlColor="#666" fontSize="large" />
            <Typography variant="body1" color="textSecondary">
              {emptyMessage}
            </Typography>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Stack
      spacing={5}
      alignItems="center"
      sx={{
        width: '100%',
      }}
    >
      <Stack spacing={2} sx={{ width: '100%' }}>
        {noggins.map((noggin) => (
          <NogginCard key={noggin.slug} noggin={noggin} />
        ))}
      </Stack>

      <Box alignSelf="center">
        <Pagination
          page={page}
          count={pageCount}
          renderItem={(item) => (
            <PaginationItem
              component={Link}
              to={`${currentPathname}${
                item.page === 1 ? '' : `?${paginationParameter}=${item.page}`
              }`}
              {...item}
            />
          )}
        />
      </Box>
    </Stack>
  );
}
