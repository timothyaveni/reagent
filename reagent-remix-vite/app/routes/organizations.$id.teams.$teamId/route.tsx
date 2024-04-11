import { Autocomplete, Button, TextField, Typography } from '@mui/material';
import { Form, UIMatch, useLoaderData } from '@remix-run/react';
import { LoaderFunctionArgs, redirect } from '@remix-run/server-runtime';
import { useState } from 'react';
import {
  addMemberToTeam,
  getAddableMembersForTeam,
  loadTeam,
  mayAddMembers,
} from '~/models/team.server';
import { notFound } from '~/route-utils/status-code';

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  const { teamId } = params;

  if (!teamId) {
    throw notFound();
  }

  const teamIdInt = parseInt(teamId, 10);

  const team = await loadTeam(context, teamIdInt);

  const userMayAddMembers = await mayAddMembers(context, team.id);
  let addableMembers: Awaited<ReturnType<typeof getAddableMembersForTeam>> = [];
  if (userMayAddMembers) {
    addableMembers = await getAddableMembersForTeam(context, team.id);
  }

  return { team, userMayAddMembers, addableMembers };
};

export const action = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  const { id, teamId } = params;

  if (!id) {
    throw notFound();
  }

  if (!teamId) {
    throw notFound();
  }

  const teamIdInt = parseInt(teamId, 10);

  const formData = await request.formData();
  const action = formData.get('action')?.toString() || null;

  if (action === 'addMember') {
    const memberId = formData.get('memberId')?.toString();

    if (!memberId) {
      throw new Error('Member is required');
    }

    console.log({ memberId });

    const memberIdInt = parseInt(memberId, 10);

    if (isNaN(memberIdInt)) {
      throw new Error('Invalid member ID');
    }

    await addMemberToTeam(context, {
      teamId: teamIdInt,
      userId: memberIdInt,
    });

    return redirect(`/organizations/${id}/teams/${teamId}`);
  }

  throw notFound();
};

export const handle = {
  breadcrumb: ({
    match,
    isLeaf,
  }: {
    match: UIMatch<typeof loader>;
    isLeaf: boolean;
  }) => {
    return match.data.team.name;
  },
};

export default function TeamView() {
  const { team, userMayAddMembers, addableMembers } =
    useLoaderData<typeof loader>();
  const [memberId, setMemberId] = useState('');

  return (
    <div>
      <Typography variant="h2">{team.name}</Typography>

      <Typography variant="h3">Members</Typography>
      <ul>
        {team.members.map((member) => (
          <li key={member.id}>{member.userInfo?.displayName}</li>
        ))}
      </ul>

      {userMayAddMembers && (
        <>
          <Typography variant="h3">Add members</Typography>
          <Form method="post">
            <input type="hidden" name="action" value="addMember" />
            <Autocomplete
              options={addableMembers}
              getOptionLabel={(option) => option.userInfo?.displayName || ''}
              renderInput={(params) => <TextField {...params} label="Member" />}
              getOptionKey={(option) => option.id.toString()}
              onChange={(_, value) => {
                if (value) {
                  setMemberId(value.id.toString());
                }
              }}
            />
            <input type="hidden" name="memberId" value={memberId} />
            <Button type="submit" variant="contained">
              Add
            </Button>
          </Form>
        </>
      )}
    </div>
  );
}
