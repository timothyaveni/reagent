import {
  Autocomplete,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Form, UIMatch, useLoaderData } from '@remix-run/react';
import { LoaderFunctionArgs, redirect } from '@remix-run/server-runtime';
import { useState } from 'react';
import {
  loadNogginIndexCountForTeam,
  loadNogginsIndexForTeam,
} from '~/models/noggin.server';
import {
  addMemberToTeam,
  getAddableMembersForTeam,
  loadTeam,
  mayAddMembers,
  mayManageTeamBudget,
  setTeamTotalBudget,
} from '~/models/team.server';
import { notFound } from '~/route-utils/status-code';
import { NogginIndexBody } from '../noggins._index/NogginIndexBody';

const NOGGIN_PAGE_SIZE = 20;

export const loader = async ({
  params,
  context,
  request,
}: LoaderFunctionArgs) => {
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

  const currentTeamTotalBudgetQuastra = team.totalPermittedSpendQuastra;
  const userMayManageBudget = await mayManageTeamBudget(context, team.id);

  const { searchParams } = new URL(request.url);
  const nogginsPage =
    parseInt(searchParams.get('nogginsPage')?.toString() || '1', 10) || 1;

  const [teamNoggins, teamNogginsCount] = await Promise.all([
    loadNogginsIndexForTeam(context, {
      teamId: team.id,
      pageSize: NOGGIN_PAGE_SIZE,
      pageZeroIndexed: nogginsPage - 1,
    }),
    loadNogginIndexCountForTeam(context, team.id),
  ]);

  return {
    team,
    userMayAddMembers,
    addableMembers,
    userMayManageBudget,
    currentTeamTotalBudgetQuastra,
    teamNoggins,
    nogginsPage,
    teamNogginsCount,
  };
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
  } else if (action === 'setBudget') {
    const budget = formData.get('budget')?.toString();

    if (!budget) {
      throw new Error('Budget is required');
    }

    const budgetQuastraInt = parseInt(budget, 10);

    if (isNaN(budgetQuastraInt)) {
      throw new Error('Invalid budget');
    }

    await setTeamTotalBudget(context, {
      teamId: teamIdInt,
      budgetQuastra: budgetQuastraInt,
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
    return <Typography>{match.data.team.name}</Typography>;
  },
};

export default function TeamView() {
  const {
    team,
    userMayAddMembers,
    addableMembers,
    currentTeamTotalBudgetQuastra,
    userMayManageBudget,
    teamNoggins,
    nogginsPage,
    teamNogginsCount,
  } = useLoaderData<typeof loader>();
  const [memberId, setMemberId] = useState('');

  return (
    <Stack spacing={3}>
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

      {userMayManageBudget ? (
        <Form method="post">
          <input type="hidden" name="action" value="setBudget" />
          <TextField
            label="Total Budget"
            name="budget"
            type="number"
            defaultValue={currentTeamTotalBudgetQuastra}
          />
          <Button type="submit" variant="contained">
            Set Total Budget
          </Button>
        </Form>
      ) : (
        <Typography variant="h3">
          Total Budget: {currentTeamTotalBudgetQuastra}
        </Typography>
      )}

      <NogginIndexBody
        noggins={teamNoggins}
        emptyMessage="No noggins"
        page={nogginsPage}
        pageCount={Math.ceil(teamNogginsCount / NOGGIN_PAGE_SIZE)}
        paginationParameter="nogginsPage"
      />
    </Stack>
  );
}
