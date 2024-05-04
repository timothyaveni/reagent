import {
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useLoaderData, useSubmit } from '@remix-run/react';
import { LoaderFunctionArgs, json } from '@remix-run/server-runtime';
import { useState } from 'react';
import { CardActionAreaLink } from '~/components/CardActionAreaLink.js';
import { pluralize } from '~/i18n/T.js';
import { getAllOrgTeamsForManagement } from '~/models/team.server';
import { notFound } from '~/route-utils/status-code';

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  const { id } = params;

  if (!id) {
    throw notFound();
  }

  const idInt = parseInt(id, 10);

  const teams = await getAllOrgTeamsForManagement(context, idInt);

  return json({ orgId: idInt, teams });
};

export default function OrganizationTeamManagement() {
  const { orgId, teams } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false);

  return (
    <>
      <Typography variant="h2">Manage teams</Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          setCreateTeamModalOpen(true);
        }}
      >
        Create a new team
      </Button>

      <Dialog
        open={createTeamModalOpen}
        onClose={() => setCreateTeamModalOpen(false)}
        aria-labelledby="create-team-modal-title"
        aria-describedby="create-team-modal-description"
      >
        <Paper sx={{ p: 2 }}>
          <Typography variant="h3" id="create-team-modal-title">
            Create a new team
          </Typography>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // @ts-expect-error ts is just wrong
              const name = (e.currentTarget.name as HTMLInputElement).value;
              submit(
                {
                  action: 'create',
                  name,
                },
                {
                  action: `/organizations/${orgId}/teams`,
                  method: 'post',
                },
              );
            }}
          >
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" required />
            <Button type="submit">Create</Button>
          </form>
        </Paper>
      </Dialog>

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
    </>
  );
}
