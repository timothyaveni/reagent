import {
  Button,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { Form, useLoaderData, useSubmit } from '@remix-run/react';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
} from '@remix-run/server-runtime';
import { unit } from 'reagent-noggin-shared/cost-calculation/units';
import { MaybeUnlimitedCostText } from '~/components/CostText';
import T, { t } from '~/i18n/T';
import {
  getAllOrganizationInvitesForOrganization,
  inviteGithubUserToOrganization,
} from '~/models/organizationMembership.server';
import { notFound } from '~/route-utils/status-code';
import { OrganizationRole } from '~/shared/organization';

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  const { id } = params;

  if (!id) {
    throw notFound();
  }

  const invites = await getAllOrganizationInvitesForOrganization(context, {
    organizationId: parseInt(id, 10),
  });

  return json({
    invites,
  });
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

  const formData = await request.formData();
  const action = formData.get('action')?.toString() || null;

  if (action === 'invite') {
    const githubUsername = formData.get('githubUsername')?.toString();
    const role = formData.get('role')?.toString() || 'member';
    const budgetCredits =
      formData.get('initialBudgetCredits')?.toString() || 'unlimited';

    if (!githubUsername) {
      throw new Error('Invalid GitHub username');
    }

    if (role !== 'member' && role !== 'manager') {
      throw new Error('Invalid role');
    }

    const budgetQuastra =
      budgetCredits === 'unlimited'
        ? null
        : Math.round(
            unit(parseFloat(budgetCredits), 'credits').toNumber('quastra'),
          );

    await inviteGithubUserToOrganization(context, {
      organizationId: parseInt(id, 10),
      githubUsername,
      role: role as OrganizationRole,
      initialBudgetQuastra: budgetQuastra,
    });

    return json({ sucess: true });
  }

  throw new Error('Invalid action');
};

export default function OrganizationInviteList() {
  const { invites } = useLoaderData<typeof loader>();

  const submit = useSubmit();

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>GitHub username</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Logged in once?</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Permitted spend</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invites.map((invite) => (
            <TableRow key={invite.id}>
              <TableCell>{invite.githubUsername}</TableCell>
              <TableCell>{invite.role}</TableCell>
              <TableCell>{invite.attachedUserId !== null}</TableCell>
              <TableCell>{invite.inviteStatus}</TableCell>
              <TableCell>
                <MaybeUnlimitedCostText quastra={invite.initialBudgetQuastra} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <h2>
        <T>Invite new member</T>
      </h2>
      <Form method="post">
        <input type="hidden" name="action" value="invite" />
        <Stack spacing={2} direction="row" alignItems="center">
          <TextField name="githubUsername" label={t('GitHub username')} />
          <Select name="role" defaultValue="member">
            <MenuItem value="member">Member</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
          </Select>
          <TextField
            name="initialBudgetCredits"
            label={t('Initial budget (credits)')}
          />
          <Button type="submit" variant="contained" color="primary">
            <T>Invite</T>
          </Button>
        </Stack>
      </Form>
    </>
  );
}
