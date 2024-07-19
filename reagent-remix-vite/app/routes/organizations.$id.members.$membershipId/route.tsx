import { Stack, Typography } from '@mui/material';
import { useLoaderData } from '@remix-run/react';
import { LoaderFunctionArgs, json } from '@remix-run/server-runtime';
import T from '~/i18n/T.js';
import {
  loadOrganization,
  loadOrganizationMembership,
  requireAtLeastUserOrganizationRole,
} from '~/models/organization.server';
import { notFound } from '~/route-utils/status-code';
import { OrganizationRole } from '~/shared/organization';
import { NogginIndexBody } from '../noggins._index/NogginIndexBody.js';

const NOGGIN_PAGE_SIZE = 20;

export const loader = async ({
  params,
  request,
  context,
}: LoaderFunctionArgs) => {
  const { id, membershipId } = params;

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

  const { searchParams } = new URL(request.url);
  const nogginsPage =
    parseInt(searchParams.get('nogginsPage')?.toString() || '1', 10) || 1;
  const membership = await loadOrganizationMembership(context, {
    organizationId: organization.id,
    membershipId: parseInt(membershipId || '0', 10),
    nogginsPageSize: NOGGIN_PAGE_SIZE,
    nogginsPageZeroIndexed: nogginsPage - 1,
  });

  return json({
    // organization,
    membership,
    nogginsPage,
  });
};

export default function OrganizationMembership() {
  const { membership, nogginsPage } = useLoaderData<typeof loader>();

  return (
    <Stack spacing={2}>
      <Typography>
        <T>Noggins within this organization for this user:</T>
      </Typography>
      <NogginIndexBody
        noggins={membership.noggins}
        emptyMessage="No noggins"
        page={nogginsPage}
        pageCount={Math.ceil(membership.nogginsCount / NOGGIN_PAGE_SIZE)}
        paginationParameter="nogginsPage"
      />
    </Stack>
  );
}
