import { Typography } from '@mui/material';
import { UIMatch, useLoaderData } from '@remix-run/react';
import { LoaderFunctionArgs } from '@remix-run/server-runtime';
import { loadTeam } from '~/models/team.server';
import { notFound } from '~/route-utils/status-code';

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  const { teamId } = params;

  if (!teamId) {
    throw notFound();
  }

  const teamIdInt = parseInt(teamId, 10);

  const team = await loadTeam(context, teamIdInt);

  return { team };
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
  const { team } = useLoaderData<typeof loader>();

  return (
    <div>
      <Typography variant="h2">{team.name}</Typography>
    </div>
  );
}
