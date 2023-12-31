import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';
import { json } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { LoaderFunctionArgs } from '@remix-run/server-runtime';
import T, { pluralize } from '~/i18n/T';
import { indexOrganizations } from '~/models/organization.server';

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const organizations = await indexOrganizations(context);

  return json({ organizations });
};

export default function OrganizationsList() {
  const { organizations } = useLoaderData<typeof loader>();
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
        <h1>
          <T>Organizations</T>
        </h1>
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

      <Box mb={6}>
        <Typography variant="body1">
          {organizations.length > 0 ? (
            <T>These are the organizations you're a member of.</T>
          ) : (
            <T>You're not a member of any organizations.</T>
          )}
        </Typography>
      </Box>

      <Stack spacing={2}>
        {organizations.map((organization) => {
          return (
            <Card variant="outlined">
              <CardActionArea
                onClick={() => navigate(`/organizations/${organization.id}`)}
              >
                <CardContent>
                  <Typography variant="h5" component="h3">
                    {organization.name}
                  </Typography>
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
    </div>
  );
}
