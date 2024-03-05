import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { useLoaderData } from '@remix-run/react';
import { LoaderFunctionArgs, json } from '@remix-run/server-runtime';
import { CostText } from '~/components/CostText';
import T from '~/i18n/T';
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

export default function OrganizationMemberList() {
  const { organization, memberList } = useLoaderData<typeof loader>();

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Display name</TableCell>
          <TableCell>Role</TableCell>
          <TableCell>Permitted spend</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {memberList.map((member) => (
          <TableRow key={member.user.id}>
            <TableCell>{member.user.userInfo?.displayName}</TableCell>
            <TableCell>{member.role}</TableCell>
            <TableCell>
              {member.totalPermittedSpendQuastra === null ? (
                <T>unlimited</T>
              ) : (
                <CostText quastra={member.totalPermittedSpendQuastra} />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
