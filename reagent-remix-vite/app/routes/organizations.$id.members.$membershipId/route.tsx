import { useLoaderData, useSubmit } from '@remix-run/react';
import { LoaderFunctionArgs, json } from '@remix-run/server-runtime';
import {
  loadOrganization,
  loadOrganizationMemberList,
  requireAtLeastUserOrganizationRole,
} from '~/models/organization.server';
import { notFound } from '~/route-utils/status-code';
import { OrganizationRole } from '~/shared/organization';

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  const { id } = params;

  if (!id) {
    throw notFound();
  }

  const organization = await loadOrganization(context, {
    id: parseInt(id, 10),
  });

  if (!organization) {
    throw notFound();
  }

  await requireAtLeastUserOrganizationRole(context, {
    organizationId: organization.id,
    role: OrganizationRole.MANAGER,
  });

  const memberList = await loadOrganizationMemberList(context, {
    organizationId: organization.id,
  });

  return json({
    organization,
    memberList,
  });
};

export default function OrganizationMembership() {
  const { organization, memberList } = useLoaderData<typeof loader>();

  const submit = useSubmit();

  return 'hi';
}
