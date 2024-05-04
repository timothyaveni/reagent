import { BlurOn } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useLoaderData } from '@remix-run/react';

import { ActionFunctionArgs, json } from '@remix-run/server-runtime';
import { CardActionAreaLink } from '~/components/CardActionAreaLink.js';
import T, { pluralize } from '~/i18n/T';
import { getTeamsForOrgAndUser } from '~/models/team.server';
import { notFound } from '~/route-utils/status-code';

export const loader = async ({ params, context }: ActionFunctionArgs) => {
  const { id } = params;

  if (!id) {
    throw notFound();
  }

  const idInt = parseInt(id, 10);

  const userTeamsInOrg = await getTeamsForOrgAndUser(context, idInt);

  return json({
    orgId: idInt,
    teams: userTeamsInOrg,
  });
};

export default function OrganizationTeamList() {
  const { orgId, teams } = useLoaderData<typeof loader>();

  return (
    <>
      <Typography variant="h2">Your teams</Typography>

      {teams.map((team) => (
        <Card variant="outlined" key={team.id} sx={{ mt: 2 }}>
          <CardActionAreaLink to={`/organizations/${orgId}/teams/${team.id}`}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="h2">{team.name}</Typography>
                <Chip
                  label={pluralize(
                    team._count.noggins,
                    'noggin',
                    'noggins',
                    true,
                  )}
                />
              </Stack>
            </CardContent>
          </CardActionAreaLink>
        </Card>
      ))}

      {teams.length === 0 && (
        <Box mt={4}>
          <Paper
            elevation={2}
            sx={{
              maxWidth: '80%',
              mx: 'auto',
              p: 3,
            }}
          >
            <Stack spacing={2} alignItems={'center'}>
              <BlurOn htmlColor="#666" fontSize="large" />
              <Typography variant="body1" color="textSecondary">
                <T>
                  Looks like you're not a member of any teams in this
                  organization! You can still create noggins for yourself within
                  the organization, though.
                </T>
              </Typography>
            </Stack>
          </Paper>
        </Box>
      )}
    </>
  );
}
