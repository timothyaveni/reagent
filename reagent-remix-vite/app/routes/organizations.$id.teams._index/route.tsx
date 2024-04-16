import { BlurOn } from '@mui/icons-material';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { useLoaderData } from '@remix-run/react';

import { ActionFunctionArgs, json } from '@remix-run/server-runtime';
import T from '~/i18n/T';
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
        <Paper
          key={team.id}
          elevation={2}
          sx={{
            maxWidth: '80%',
            mx: 'auto',
            p: 3,
            mt: 2,
          }}
        >
          <a href={`/organizations/${orgId}/teams/${team.id}`}>
            <Typography variant="h4">{team.name}</Typography>
          </a>
        </Paper>
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