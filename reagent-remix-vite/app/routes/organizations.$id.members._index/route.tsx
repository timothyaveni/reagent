import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { useLoaderData, useSubmit } from '@remix-run/react';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
} from '@remix-run/server-runtime';
import { unit } from 'reagent-noggin-shared/cost-calculation/units';
import { CostText } from '~/components/CostText';
import MUILink from '~/components/MUILink.js';
import T from '~/i18n/T';
import {
  loadOrganization,
  loadOrganizationMemberList,
  requireAtLeastUserOrganizationRole,
} from '~/models/organization.server';
import { setBudgetForMembership } from '~/models/organizationMembership.server';
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

export const action = async ({
  request,
  params,
  context,
}: ActionFunctionArgs) => {
  const formData = await request.formData();

  const action = formData.get('action')?.toString();

  if (!action) {
    throw new Error('Invalid request');
  }

  if (action === 'setBudget') {
    const membershipId = parseInt(
      formData.get('membershipId')?.toString() || '',
      10,
    );
    const budgetQuastraString = formData.get('budgetQuastra')?.toString();
    console.log('budgetQuastraString', budgetQuastraString);
    const budgetQuastra =
      budgetQuastraString === null || budgetQuastraString === 'null'
        ? null
        : parseFloat(budgetQuastraString || '0');
    console.log('budgetQuastra', budgetQuastra);

    await setBudgetForMembership(context, {
      membershipId,
      budgetQuastra,
    });

    return json({ success: true });
  }

  throw new Error('Invalid request');
};

function MemberBudgetCell({
  totalPermittedSpendQuastra,
  setNewBudget,
}: {
  totalPermittedSpendQuastra: number | null;
  setNewBudget: (newBudgetQuastra: number | null) => void;
}) {
  return (
    <Button
      variant="text"
      color="primary"
      onClick={() => {
        const newBudgetString = window.prompt(
          // THIS IS SINFUL BUT I HAVE THINGS TO DO
          'Enter new budget',
          totalPermittedSpendQuastra === null
            ? 'unlimited'
            : unit(totalPermittedSpendQuastra, 'quastra')
                .toNumber('credits')
                .toString(),
        );

        if (newBudgetString === null) {
          return;
        }

        if (newBudgetString === 'unlimited') {
          setNewBudget(null);
          return;
        }

        const newBudgetCredits = parseFloat(newBudgetString);

        if (isNaN(newBudgetCredits)) {
          alert('Invalid number');
          return;
        }

        setNewBudget(unit(newBudgetCredits, 'credits').toNumber('quastra'));
      }}
    >
      {totalPermittedSpendQuastra === null ? (
        <T>Unlimited</T>
      ) : (
        <CostText quastra={totalPermittedSpendQuastra} />
      )}
    </Button>
  );
}

export default function OrganizationMemberList() {
  const { organization, memberList } = useLoaderData<typeof loader>();

  const submit = useSubmit();

  const setNewBudgetForMembership =
    (membershipId: number) => async (newBudgetQuastra: number | null) => {
      submit(
        {
          action: 'setBudget',
          budgetQuastra: newBudgetQuastra,
          membershipId,
        },
        {
          method: 'POST',
          navigate: false,
        },
      );
    };

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
        {memberList.map((membership) => (
          <TableRow key={membership.user.id}>
            <TableCell>
              <MUILink
                to={`/organizations/${organization.id}/members/${membership.id}`}
              >
                {membership.user.userInfo?.displayName}
              </MUILink>
            </TableCell>
            <TableCell>{membership.role}</TableCell>
            <TableCell>
              <MemberBudgetCell
                totalPermittedSpendQuastra={
                  membership.totalPermittedSpendQuastra
                }
                setNewBudget={setNewBudgetForMembership(membership.id)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
