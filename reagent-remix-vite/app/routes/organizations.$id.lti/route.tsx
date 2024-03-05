import { UIMatch, useLoaderData } from '@remix-run/react';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
} from '@remix-run/server-runtime';
import { BreadcrumbLink } from '~/components/BreadcrumbLink';
import T from '~/i18n/T';
import { createNewLTIConnection } from '~/models/ltiConnection.server';
import {
  OrganizationLoadOwnerResponse,
  loadOrganization,
  requireAtLeastUserOrganizationRole,
} from '~/models/organization.server';
import { notFound } from '~/route-utils/status-code';
import { OrganizationRole } from '~/shared/organization';
import LTIConnectionConfig from './LTIConnectionConfig';

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

  await requireAtLeastUserOrganizationRole(context, {
    organizationId: organizationData.id,
    role: OrganizationRole.OWNER,
  });

  return json({
    organization: organizationData as OrganizationLoadOwnerResponse,
    ltiBaseUrl: process.env.REAGENT_EXTERNAL_URL || '', // TODO warn?
  });
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
    return json({ success: true });
  }

  throw notFound();
};

export const handle = {
  breadcrumb: ({ match, isLeaf }: { match: UIMatch; isLeaf: boolean }) => {
    return (
      <BreadcrumbLink to="/organizations" isLeaf={isLeaf}>
        <T>LTI</T>
      </BreadcrumbLink>
    );
  },
};

export default function OrganizationLTI() {
  const { organization, ltiBaseUrl } = useLoaderData<typeof loader>();

  return (
    <LTIConnectionConfig
      ltiConnection={organization.ltiConnection}
      ltiBaseUrl={ltiBaseUrl}
    />
  );
}
