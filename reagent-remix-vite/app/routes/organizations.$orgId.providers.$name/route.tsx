import { Alert, Box, Breadcrumbs, Typography } from '@mui/material';
import { useActionData, useLoaderData, useSubmit } from '@remix-run/react';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from '@remix-run/server-runtime';
import { requireUser } from '~/auth/auth.server';
import { ModelProviderCredentialsForm } from '~/components/ModelProviderCredentials/ModelProviderCredentialsForm';
import {
  getProviderCredentialsForOrg,
  getProviderPublicData,
  upsertProviderCredentialsForOrg,
} from '~/models/provider.server';
import { notFound } from '~/route-utils/status-code';

import { json } from '@remix-run/node';
import MUILink from '~/components/MUILink';

import { ServerRuntimeMetaFunction as MetaFunction } from '@remix-run/server-runtime';
import T from '~/i18n/T';
import { loadOrganization } from '~/models/organization.server';
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `${data?.provider.friendlyName} :: Providers :: reagent` },
    {
      name: 'description',
      content: `Overview of provider ${data?.provider.friendlyName} on reagent`,
    },
  ];
};

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  requireUser(context);

  const { name, orgId: orgIdParam } = params;
  const orgId = orgIdParam ? parseInt(orgIdParam, 10) : null;

  const [provider, organization] = await Promise.all([
    getProviderPublicData(name),
    loadOrganization(context, { id: orgId }),
  ]);

  if (!provider) {
    throw notFound();
  }

  if (!organization) {
    throw notFound();
  }

  const dbCredentials = await getProviderCredentialsForOrg(context, {
    orgId: organization.id,
    providerId: provider.id,
    providerCredentialsSchemaVersion: provider.credentialsSchemaVersion,
  });

  return {
    provider,
    organization,
    currentCredentials: dbCredentials?.credentials || {},
  };
};

export const action = async ({
  request,
  params,
  context,
}: ActionFunctionArgs) => {
  const data: {
    credentials: Record<string, unknown>;
    credentialsVersion: number;
  } = await request.json();
  // todos: same as personal creds

  const { name, orgId: orgIdParam } = params;
  const orgId = orgIdParam ? parseInt(orgIdParam, 10) : null;

  if (orgId === null) {
    throw notFound();
  }

  await upsertProviderCredentialsForOrg(context, {
    providerName: name || '',
    orgId,
    credentials: data.credentials,
    credentialsSchemaVersion: data.credentialsVersion,
  });

  return json({
    success: true,
  });
};

export default function Provider() {
  const { provider, organization, currentCredentials } =
    useLoaderData<typeof loader>();
  const actionResponse = useActionData<typeof action>();
  const submit = useSubmit();

  return (
    <Box mt={4}>
      <Breadcrumbs>
        <MUILink to="/organizations" underline="hover">
          Organizations
        </MUILink>
        <MUILink to={`/organizations/${organization.id}`} underline="hover">
          {organization.name}
        </MUILink>
        {/* <MUILink to={`/organizations/${organization.id}/providers`} underline="hover"> */}
        <Typography color="text.primary">Providers</Typography>
        {/* </MUILink> */}
        <Typography color="text.primary">{provider.friendlyName}</Typography>
      </Breadcrumbs>

      <h1>{provider.friendlyName}</h1>

      <h2>Credentials</h2>
      <p>
        <T flagged>
          For members of the <strong>{organization.name}</strong> organization
          to be able to use models from {provider.friendlyName} in organization
          noggins, you need to configure credentials.
        </T>
      </p>

      <ModelProviderCredentialsForm
        credentialsSchema={
          provider.credentialsSchema as any // TODO get this type outta there
        }
        currentCredentials={currentCredentials as Record<string, string>}
        onSubmit={(credentials: any) => {
          // alert(JSON.stringify(credentials));
          submit(
            {
              credentials,
              credentialsVersion: provider.credentialsSchemaVersion,
            },
            {
              method: 'post',
              encType: 'application/json',
            },
          );
        }}
      />
      {actionResponse?.success ? (
        <Alert severity="success">Credentials saved!</Alert>
      ) : null}
    </Box>
  );
}
