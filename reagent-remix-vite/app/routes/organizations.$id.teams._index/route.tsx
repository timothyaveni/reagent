import { BlurOn } from '@mui/icons-material';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { useLoaderData } from '@remix-run/react';

import { ActionFunctionArgs, json, redirect } from '@remix-run/server-runtime';
import T from '~/i18n/T';
import { createTeam, getTeamsForOrgAndUser } from '~/models/team.server';
import { notFound } from '~/route-utils/status-code';

export const loader = async ({ params, context }: ActionFunctionArgs) => {
  const { id } = params;

  if (!id) {
    throw notFound();
  }

  const idInt = parseInt(id, 10);

  const userTeamsInOrg = await getTeamsForOrgAndUser(context, idInt);

  return json({
    teams: userTeamsInOrg,
  });
};

export const action = async ({
  request,
  params,
  context,
}: ActionFunctionArgs) => {
  const { id } = params;

  if (!id) {
    throw notFound();
  }

  const idInt = parseInt(id, 10);

  const formData = await request.formData();
  const action = formData.get('action')?.toString() || null;

  if (action === 'create') {
    const name = formData.get('name')?.toString();

    if (!name) {
      throw new Error('Name is required');
    }

    const team = await createTeam(context, {
      organizationId: idInt,
      name,
    });

    return redirect(`/organizations/${id}/teams/${team.id}`);
  }

  throw notFound();
};

export default function OrganizationTeamList() {
  const { teams } = useLoaderData<typeof loader>();

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
          <Typography variant="h4">{team.name}</Typography>
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
