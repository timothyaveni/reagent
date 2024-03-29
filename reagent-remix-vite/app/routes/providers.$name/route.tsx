import { Alert, Box, Breadcrumbs, Typography } from '@mui/material';
import { useActionData, useLoaderData, useSubmit } from '@remix-run/react';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from '@remix-run/server-runtime';
import { requireUser } from '~/auth/auth.server';
import { ModelProviderCredentialsForm } from '~/components/ModelProviderCredentials/ModelProviderCredentialsForm';
import { indexOrganizations } from '~/models/organization.server';
import {
  getProviderCredentialsForUser,
  getProviderPublicData,
  upsertProviderCredentialsForUser,
} from '~/models/provider.server';
import { notFound } from '~/route-utils/status-code';

import { json } from '@remix-run/node';
import MUILink from '~/components/MUILink';

import { ServerRuntimeMetaFunction as MetaFunction } from '@remix-run/server-runtime';
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

  const { name } = params;

  const [provider, orgs] = await Promise.all([
    getProviderPublicData(name),
    indexOrganizations(context),
  ]);

  if (!provider) {
    throw notFound();
  }

  const dbCredentials = await getProviderCredentialsForUser(context, {
    providerId: provider.id,
    providerCredentialsSchemaVersion: provider.credentialsSchemaVersion,
  });

  return {
    provider,
    orgs,
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
  // todo: it may be wise to validate the data against the schema here
  // todo: also, check that the key actually works
  // todo: also, uh, maybe look into encrypting the credentials

  // big todo: write-only

  const { name } = params;

  await upsertProviderCredentialsForUser(context, {
    providerName: name || '',
    credentials: data.credentials,
    credentialsSchemaVersion: data.credentialsVersion,
  });

  return json({
    success: true,
  });
};

export default function Provider() {
  const { provider, orgs, currentCredentials } = useLoaderData<typeof loader>();
  const actionResponse = useActionData<typeof action>();
  const submit = useSubmit();

  return (
    <Box mt={4}>
      <Breadcrumbs>
        <MUILink to="/providers" underline="hover">
          Providers
        </MUILink>
        <Typography color="text.primary">{provider.friendlyName}</Typography>
      </Breadcrumbs>

      <h1>{provider.friendlyName}</h1>

      <h2>Credentials</h2>
      <p>
        To use models from {provider.friendlyName} in your personal noggins, you
        need to configure credentials.
      </p>

      {orgs.length === 1 ? (
        <Alert severity="info">
          I notice you're a member of the <strong>{orgs[0].name}</strong>{' '}
          organization. Any noggins you make owned by that organization will be
          billed to <strong>{orgs[0].name}</strong>, so you don't need to
          configure any credentials here. If you do want to make your own
          personal noggins and pay for them yourself, that's what this page is
          for.
        </Alert>
      ) : null}

      {orgs.length > 1 ? (
        <Alert severity="info">
          I notice you're a member of some organizations (e.g.{' '}
          <strong>{orgs[0].name}</strong>, <strong>{orgs[1].name}</strong>). Any
          organization-owned noggins you make will be billed to that
          organization, so you don't need to configure any credentials here. If
          you do want to make your own personal noggins and pay for them
          yourself, that's what this page is for.
        </Alert>
      ) : null}

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
