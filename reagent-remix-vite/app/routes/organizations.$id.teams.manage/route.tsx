import { Button, Dialog, Paper, Typography } from '@mui/material';
import { useLoaderData, useSubmit } from '@remix-run/react';
import { LoaderFunctionArgs, json } from '@remix-run/server-runtime';
import { useState } from 'react';
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
    </>
  );
}
