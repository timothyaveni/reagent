import { BlurOn } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { json } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { LoaderFunctionArgs, SerializeFrom } from '@remix-run/server-runtime';
import T, { pluralize } from '~/i18n/T';
import { indexOrganizations } from '~/models/organization.server';

import { ServerRuntimeMetaFunction as MetaFunction } from '@remix-run/server-runtime';
import { getPendingOrganizationInvitesForUser } from '~/models/organizationMembership.server';
import { PendingOrganizationInvite } from './PendingOrganizationInvite';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `Organizations :: reagent` },
    {
      name: 'description',
      content: `Organizations`,
    },
  ];
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const organizations = await indexOrganizations(context);

  const pendingInvites = await getPendingOrganizationInvitesForUser(context);

  return json({ organizations, pendingInvites });
};

export const handle = {
  hideAllBreadcrumbs: true,
};

type OrganizationsListLoader = typeof loader;
type OrganizationsListLoaderData = SerializeFrom<OrganizationsListLoader>;

function OrganizationsListBody({
  organizations,
}: {
  organizations: OrganizationsListLoaderData['organizations'];
}) {
  const navigate = useNavigate();

  if (organizations.length === 0) {
    return (
      <Box>
        <Paper
          elevation={2}
          // don't take up the full width:
          sx={{
            width: 'fit-content',
            mx: 'auto',
            p: 3,
          }}
        >
          <Stack spacing={2} alignItems={'center'}>
            <BlurOn htmlColor="#666" fontSize="large" />
            <Typography variant="body1" color="textSecondary">
              <T>
                Looks like you're not a member of any organizations right now.
              </T>
            </Typography>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <>
      <Box mb={6}>
        <Typography variant="body1">
          <T>These are the organizations you're a member of.</T>
        </Typography>
      </Box>
      <Stack spacing={2}>
        {organizations.map((organization) => {
          return (
            <Card variant="outlined" key={organization.id}>
              <CardActionArea
                onClick={() => navigate(`/organizations/${organization.id}`)}
              >
                <CardContent>
                  <Typography variant="h2">{organization.name}</Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="p"
                    className="noggin-description"
                  >
                    {pluralize(
                      organization._count.members,
                      'member',
                      'members',
                      true,
                    )}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Stack>
    </>
  );
}

export default function OrganizationsList() {
  const { organizations, pendingInvites } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <div>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        mb={4}
        mt={4}
        sx={{ justifyContent: 'space-between' }}
      >
        <Typography variant="h1">
          <T>Organizations</T>
        </Typography>
        <Button
          sx={{
            textTransform: 'none',
          }}
          variant="contained"
          onClick={() => navigate('/organizations/new')}
        >
          <T>
            <Typography variant="button">+ new organization</Typography>
          </T>
        </Button>
      </Stack>

      {pendingInvites.length > 0 && (
        <Stack spacing={2} mb={4}>
          {pendingInvites.map((invite) => (
            <PendingOrganizationInvite key={invite.id} invite={invite} />
          ))}
        </Stack>
      )}

      <OrganizationsListBody organizations={organizations} />
    </div>
  );
}
