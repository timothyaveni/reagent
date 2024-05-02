import { useLoaderData } from '@remix-run/react';
import { LoaderFunctionArgs, json } from '@remix-run/server-runtime';
import { CostText } from '~/components/CostText';
import MUILink from '~/components/MUILink';
import T from '~/i18n/T';
import {
  OrganizationLoadResponse,
  getTotalNogginBudgetsForOrganizationAndOwner,
  getTotalOrganizationSpendForUser,
  getUserOrganizationRole,
  loadOrganization,
} from '~/models/organization.server';
import { notFound } from '~/route-utils/status-code';
import { OrganizationRole } from '~/shared/organization';

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

  const [spendSoFarQuastra, nogginBudgetTotal, userOrganizationRole] =
    await Promise.all([
      getTotalOrganizationSpendForUser(context, {
        organizationId: organizationData.id,
      }),
      getTotalNogginBudgetsForOrganizationAndOwner(context, {
        organizationId: organizationData.id,
        teamOwnerId: null,
      }),
      getUserOrganizationRole(context, {
        organizationId: organizationData.id,
      }),
    ]);

  return json({
    organization: organizationData,
    userOrganizationRole,
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
  const {
    organization,
    userOrganizationRole,
    ltiBaseUrl,
    spendSoFarQuastra,
    nogginBudgetTotal,
  } = useLoaderData<typeof loader>();

  return (
    <>
      <BudgetView
        organizationData={organization}
        nogginBudgetTotal={nogginBudgetTotal}
        spendSoFarQuastra={spendSoFarQuastra}
      />
      {userOrganizationRole === OrganizationRole.MANAGER ||
      userOrganizationRole === OrganizationRole.OWNER ? (
        <>
          <div>
            <MUILink to={`/organizations/${organization.id}/members`}>
              <T>Manage members</T>
            </MUILink>
          </div>
          <div>
            <MUILink to={`/organizations/${organization.id}/invites`}>
              <T>Manage invites</T>
            </MUILink>
          </div>
          <div>
            <MUILink to={`/organizations/${organization.id}/teams/manage`}>
              <T>Manage teams</T>
            </MUILink>
          </div>
        </>
      ) : null}
    </>
  );
}
