import { json, redirect } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import T from '~/i18n/T';
import {
  OrganizationLoadResponse,
  loadOrganization,
} from '~/models/organization.server';
import { notFound } from '~/route-utils/status-code';
import { OrganizationRole } from '~/shared/organization';
import LTIConnectionConfig from './LTIConnectionConfig';

import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from '@remix-run/server-runtime';
import { createNewLTIConnection } from '~/models/ltiConnection.server';

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  const { id } = params;

  if (!id) {
    throw notFound();
  }

  const organizationData = await loadOrganization(context, {
    id: parseInt(id, 10),
  });

  if (!organizationData) {
    throw notFound();
  }

  return json(organizationData);
};

export const action = async ({
  request,
  params,
  context,
}: ActionFunctionArgs) => {
  const formData = await request.formData();
  const { id } = params;

  if (!id) {
    throw notFound();
  }

  const postAction = formData.get('action')?.toString();

  console.log('postAction', postAction, formData);

  if (postAction === 'createLTIConnection') {
    console.log('creating lti connection');
    await createNewLTIConnection(context, {
      orgId: parseInt(id, 10),
    });
    return redirect(`/organizations/${id}`);
  }

  throw notFound();
};

function OrganizationView({
  organizationData,
}: {
  organizationData: OrganizationLoadResponse;
}) {
  if (organizationData.userOrganizationRole === OrganizationRole.MEMBER) {
    return null;
  } else if (
    organizationData.userOrganizationRole === OrganizationRole.MANAGER
  ) {
    return null;
  } else {
    return (
      <>
        <LTIConnectionConfig ltiConnection={organizationData.ltiConnection} />
      </>
    );
  }
}

export default function Organization() {
  const organizationData = useLoaderData<typeof loader>();

  return (
    <div>
      <Link to="/organizations">
        <T>« All my organizations</T>
      </Link>
      <h1>{organizationData.name}</h1>

      <OrganizationView organizationData={organizationData} />
    </div>
  );
}
