import { Check as CheckIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Alert, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useSubmit } from '@remix-run/react';
import { CostText } from '~/components/CostText';
import T from '~/i18n/T';
import { getPendingOrganizationInvitesForUser } from '~/models/organizationMembership.server';

export function PendingOrganizationInvite({
  invite,
}: {
  invite: Awaited<ReturnType<typeof getPendingOrganizationInvitesForUser>>[0];
}) {
  const submit = useSubmit();

  const acceptInvite = () => {
    submit(
      {
        action: 'acceptInvite',
        inviteId: invite.id,
      },
      {
        method: 'POST',
        action: '/organizations',
      },
    );
  };

  const rejectInvite = () => {
    submit(
      {
        action: 'rejectInvite',
        inviteId: invite.id,
      },
      {
        method: 'POST',
        action: '/organizations',
      },
    );
  };

  return (
    <Alert
      key={invite.id}
      severity="info"
      sx={{ width: '100%' }}
      action={
        <Stack direction="row" spacing={2}>
          <Tooltip title={<T>Accept invite</T>}>
            <IconButton
              onClick={() => {
                acceptInvite();
              }}
            >
              <CheckIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={<T>Reject invite</T>}>
            <IconButton
              onClick={() => {
                // TODO lol don't use this
                const sure = window.confirm(
                  'Are you sure you want to reject this invite?',
                );

                if (sure) {
                  rejectInvite();
                }
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      }
    >
      <Typography variant="body1">
        {invite.initialBudgetQuastra === null ? (
          <T flagged>
            You have been invited to join {invite.organization.name}.
          </T>
        ) : (
          <T flagged>
            You have been invited to join {invite.organization.name} with a
            budget of <CostText quastra={invite.initialBudgetQuastra} />.
          </T>
        )}
      </Typography>
    </Alert>
  );
}
