import { Outlet, UIMatch } from '@remix-run/react';
import { ActionFunctionArgs, redirect } from '@remix-run/server-runtime';
import { createTeam } from '~/models/team.server.js';
import { notFound } from '~/route-utils/status-code.js';

export const handle = {
  breadcrumb: ({ match, isLeaf }: { match: UIMatch; isLeaf: boolean }) => {
    return 'Teams'; // TODO
  },
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

export default function TeamParent() {
  return <Outlet />;
}
