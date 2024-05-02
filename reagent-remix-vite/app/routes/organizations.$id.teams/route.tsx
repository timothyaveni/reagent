import { Outlet, UIMatch } from '@remix-run/react';
import { ActionFunctionArgs, redirect } from '@remix-run/server-runtime';
import { BreadcrumbLink } from '~/components/BreadcrumbLink';
import T from '~/i18n/T';
import { createTeam } from '~/models/team.server.js';
import { notFound } from '~/route-utils/status-code.js';

export const handle = {
  breadcrumb: ({ match, isLeaf }: { match: UIMatch; isLeaf: boolean }) => {
    return (
      // a lil awkward not to link to the manage page but fine
      <BreadcrumbLink
        to={`/organizations/${match.params.id}/teams`}
        isLeaf={isLeaf}
      >
        <T>Teams</T>
      </BreadcrumbLink>
    );
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
