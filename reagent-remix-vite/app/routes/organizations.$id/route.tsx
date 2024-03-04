import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import {
  OrganizationLoadResponse,
  getTotalNogginBudgetsForOrganizationAndUser,
  getTotalOrganizationSpendForUser,
  loadOrganization,
} from '~/models/organization.server';
import { notFound } from '~/route-utils/status-code';
import { OrganizationRole } from '~/shared/organization';
import LTIConnectionConfig from './LTIConnectionConfig';

import { Box, Breadcrumbs, Typography } from '@mui/material';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from '@remix-run/server-runtime';
import MUILink from '~/components/MUILink';
import { createNewLTIConnection } from '~/models/ltiConnection.server';

import { ServerRuntimeMetaFunction as MetaFunction } from '@remix-run/server-runtime';
import { CostText } from '~/components/CostText';
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

  const organizationData = await loadOrganization(context, {
    id: parseInt(id, 10),
  });

  if (!organizationData) {
    throw notFound();
  }

  const [spendSoFarQuastra, nogginBudgetTotal] = await Promise.all([
    getTotalOrganizationSpendForUser(context, {
      organizationId: organizationData.id,
    }),
    getTotalNogginBudgetsForOrganizationAndUser(context, {
      organizationId: organizationData.id,
    }),
  ]);

  return json({
    organization: organizationData,
    ltiBaseUrl: process.env.REAGENT_EXTERNAL_URL || '', // TODO warn?
    spendSoFarQuastra,
    nogginBudgetTotal,
  });
};

export const action = async ({
  request,
  params,
  context,
}: ActionFunctionArgs) => {
  const formData = await request.formData();
  const { id } = params;

  if (!id) {
    throw notFound();
  }

  const postAction = formData.get('action')?.toString();

  console.log('postAction', postAction, formData);

  if (postAction === 'createLTIConnection') {
    console.log('creating lti connection');
    await createNewLTIConnection(context, {
      orgId: parseInt(id, 10),
    });
    return redirect(`/organizations/${id}`);
  }

  throw notFound();
};

function LTIView({
  organizationData,
  ltiBaseUrl,
}: {
  organizationData: OrganizationLoadResponse;
  ltiBaseUrl: string;
}) {
  if (organizationData.userOrganizationRole === OrganizationRole.MEMBER) {
    return null;
  } else if (
    organizationData.userOrganizationRole === OrganizationRole.MANAGER
  ) {
    return null;
  } else {
    return (
      <>
        <LTIConnectionConfig
          ltiConnection={organizationData.ltiConnection}
          ltiBaseUrl={ltiBaseUrl}
        />
      </>
    );
  }
}

function BudgetView({
  organizationData,
  nogginBudgetTotal,
  spendSoFarQuastra,
}: {
  organizationData: OrganizationLoadResponse;
  nogginBudgetTotal: number;
  spendSoFarQuastra: number;
}) {
  return (
    <>
      <p>
        Organization spend so far: <CostText quastra={spendSoFarQuastra} />
      </p>
      <p>
        Total noggin budgets within this organization:{' '}
        <CostText quastra={nogginBudgetTotal} />
      </p>
      <p>
        Organization total permitted budget:{' '}
        {organizationData.totalPermittedSpendQuastra ? (
          <CostText quastra={organizationData.totalPermittedSpendQuastra} />
        ) : (
          'unlimited'
        )}
      </p>
    </>
  );
}

export default function Organization() {
  const { organization, ltiBaseUrl, nogginBudgetTotal, spendSoFarQuastra } =
    useLoaderData<typeof loader>();

  return (
    <Box mt={4}>
      <Breadcrumbs>
        <MUILink to="/organizations" underline="hover">
          Organizations
        </MUILink>
        <Typography color="text.primary">{organization.name}</Typography>
      </Breadcrumbs>
      <h1>{organization.name}</h1>

      <BudgetView
        organizationData={organization}
        nogginBudgetTotal={nogginBudgetTotal}
        spendSoFarQuastra={spendSoFarQuastra}
      />

      <LTIView organizationData={organization} ltiBaseUrl={ltiBaseUrl} />
    </Box>
  );
}
