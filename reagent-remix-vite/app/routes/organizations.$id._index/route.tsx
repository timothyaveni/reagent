import { useLoaderData } from '@remix-run/react';
import { LoaderFunctionArgs, json } from '@remix-run/server-runtime';
import { CostText } from '~/components/CostText';
import {
  OrganizationLoadResponse,
  getTotalNogginBudgetsForOrganizationAndUser,
  getTotalOrganizationSpendForUser,
  loadOrganization,
} from '~/models/organization.server';
import { notFound } from '~/route-utils/status-code';

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

export default function OrganizationLoadIndex() {
  const { organization, ltiBaseUrl, spendSoFarQuastra, nogginBudgetTotal } =
    useLoaderData<typeof loader>();

  return (
    <>
      <BudgetView
        organizationData={organization}
        nogginBudgetTotal={nogginBudgetTotal}
        spendSoFarQuastra={spendSoFarQuastra}
      />
    </>
  );
}
