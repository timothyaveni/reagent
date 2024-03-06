import { AppLoadContext } from '@remix-run/server-runtime';
import prisma from '~/db';
import { OrganizationRole } from '~/shared/organization';
import { requireAtLeastUserOrganizationRole } from './organization.server';

export async function setBudgetForMembership(
  context: AppLoadContext,
  args: {
    membershipId: number;
    budgetQuastra: number | null;
  },
) {
  const { organizationId } =
    await prisma.organizationMembership.findUniqueOrThrow({
      where: { id: args.membershipId },
      select: { organizationId: true },
    });

  await requireAtLeastUserOrganizationRole(context, {
    organizationId: organizationId,
    role: OrganizationRole.MANAGER,
  });

  const roundedBudget =
    args.budgetQuastra === null ? null : Math.round(args.budgetQuastra);

  console.log('roundedBudget', roundedBudget);

  await prisma.organizationMembership.update({
    where: { id: args.membershipId },
    data: { totalPermittedSpendQuastra: roundedBudget },
  });
}
