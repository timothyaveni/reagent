import { json } from '@remix-run/node';
import { Outlet, UIMatch, useLoaderData } from '@remix-run/react';
import { loadOrganization } from '~/models/organization.server';
import { notFound } from '~/route-utils/status-code';

import { Box } from '@mui/material';
import { LoaderFunctionArgs } from '@remix-run/server-runtime';

import { ServerRuntimeMetaFunction as MetaFunction } from '@remix-run/server-runtime';
import { BreadcrumbLink } from '~/components/BreadcrumbLink';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `${data?.organization?.name} :: Organizations :: reagent` },
    {
      name: 'description',
      content: `Overview for the ${data?.organization?.name} organization on reagent`,
    },
  ];
};

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

  return json({
    organization,
    ltiBaseUrl: process.env.REAGENT_EXTERNAL_URL || '', // TODO warn?
  });
};

export const handle = {
  breadcrumb: ({
    match,
    isLeaf,
  }: {
    match: UIMatch<typeof loader>;
    isLeaf: boolean;
  }) => {
    return (
      <BreadcrumbLink
        to={`/organizations/${match.data.organization.id}`}
        isLeaf={isLeaf}
      >
        {match.data.organization.name}
      </BreadcrumbLink>
    );
  },
};

export type OrganizationLoaderType = typeof loader;

export default function Organization() {
  const { organization } = useLoaderData<typeof loader>();

  return (
    <Box mt={4}>
      <h1>{organization.name}</h1>

      <Outlet />
    </Box>
  );
}
