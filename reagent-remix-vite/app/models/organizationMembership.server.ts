import { AppLoadContext } from '@remix-run/server-runtime';
import { requireUser } from '~/auth/auth.server';
import prisma from '~/db';
import { notFound } from '~/route-utils/status-code';
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

export async function getPendingOrganizationInvitesForUser(
  context: AppLoadContext,
) {
  const user = requireUser(context);

  const invites = await prisma.organizationInvite.findMany({
    where: {
      attachedUserId: user.id,
      inviteStatus: 'pending',
    },
    select: {
      role: true,
      id: true,
      organization: {
        select: {
          name: true,
        },
      },
      initialBudgetQuastra: true,
    },
  });

  return invites.map((invite) => ({
    ...invite,
    initialBudgetQuastra:
      invite.initialBudgetQuastra === null
        ? null
        : Number(invite.initialBudgetQuastra),
  }));
}

export async function getAllOrganizationInvitesForOrganization(
  context: AppLoadContext,
  { organizationId }: { organizationId: number },
) {
  await requireAtLeastUserOrganizationRole(context, {
    organizationId,
    role: OrganizationRole.MANAGER,
  });

  const invites = await prisma.organizationInvite.findMany({
    where: {
      organizationId,
    },
    select: {
      role: true,
      id: true,
      initialBudgetQuastra: true,
      inviteStatus: true,
      githubUsername: true,
      attachedUserId: true,
    },
  });

  return invites.map((invite) => ({
    ...invite,
    initialBudgetQuastra:
      invite.initialBudgetQuastra === null
        ? null
        : Number(invite.initialBudgetQuastra),
  }));
}

export async function inviteGithubUserToOrganization(
  context: AppLoadContext,
  args: {
    organizationId: number;
    githubUsername: string;
    role: OrganizationRole;
    initialBudgetQuastra: number | null;
  },
) {
  await requireAtLeastUserOrganizationRole(context, {
    organizationId: args.organizationId,
    role: OrganizationRole.MANAGER,
  });

  const invite = await prisma.organizationInvite.create({
    data: {
      organizationId: args.organizationId,
      role: args.role,
      githubUsername: args.githubUsername,
      attachedUserId: null,
      inviteStatus: 'pending',
      initialBudgetQuastra: args.initialBudgetQuastra,
    },
  });

  return invite;
}

export async function acceptInvite(
  context: AppLoadContext,
  { inviteId }: { inviteId: number },
) {
  const user = requireUser(context);

  const invite = await prisma.organizationInvite.findUniqueOrThrow({
    where: { id: inviteId },
  });

  if (invite.attachedUserId !== user.id) {
    throw notFound();
  }

  if (invite.inviteStatus !== 'pending') {
    throw new Error('Invite is not pending');
  }

  await prisma.organizationInvite.update({
    where: { id: inviteId },
    data: {
      inviteStatus: 'accepted',
    },
  });

  await prisma.organizationMembership.create({
    data: {
      organizationId: invite.organizationId,
      userId: user.id,
      role: invite.role,
      totalPermittedSpendQuastra: invite.initialBudgetQuastra,
    },
  });
}

export async function rejectInvite(
  context: AppLoadContext,
  { inviteId }: { inviteId: number },
) {
  const user = requireUser(context);

  const invite = await prisma.organizationInvite.findUniqueOrThrow({
    where: { id: inviteId },
  });

  if (invite.attachedUserId !== user.id) {
    throw notFound();
  }

  if (invite.inviteStatus !== 'pending') {
    throw new Error('Invite is not pending');
  }

  await prisma.organizationInvite.update({
    where: { id: inviteId },
    data: {
      inviteStatus: 'rejected',
    },
  });
}
