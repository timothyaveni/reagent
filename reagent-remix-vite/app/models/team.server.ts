import { AppLoadContext } from '@remix-run/server-runtime';
import { prisma } from 'db/db';
import { requireUser } from '~/auth/auth.server';
import { notFound } from '~/route-utils/status-code';
import { OrganizationRole } from '~/shared/organization';
import { requireAtLeastUserOrganizationRole } from './organization.server';

export const getTeamsForOrgAndUser = async (
  context: AppLoadContext,
  organizationId: number,
) => {
  const user = requireUser(context);

  await requireAtLeastUserOrganizationRole(context, {
    organizationId,
    role: OrganizationRole.MEMBER,
  });

  const teams = await prisma.team.findMany({
    where: {
      organizationId,
      members: {
        some: {
          id: user.id,
        },
      },
    },
  });

  return teams;
};

export const getAllOrgTeamsForManagement = async (
  context: AppLoadContext,
  organizationId: number,
) => {
  await requireAtLeastUserOrganizationRole(context, {
    organizationId,
    role: OrganizationRole.MANAGER,
  });

  const teams = await prisma.team.findMany({
    where: {
      organizationId,
    },
  });

  return teams;
};

export const createTeam = async (
  context: AppLoadContext,
  {
    organizationId,
    name,
  }: {
    organizationId: number;
    name: string;
  },
) => {
  await requireAtLeastUserOrganizationRole(context, {
    organizationId,
    role: OrganizationRole.MANAGER,
  });

  const team = await prisma.team.create({
    data: {
      name,
      organizationId,
    },
  });

  return team;
};

export const loadTeam = async (context: AppLoadContext, teamId: number) => {
  const team = await prisma.team.findUnique({
    where: {
      id: teamId,
    },
    select: {
      id: true,
      name: true,
      organizationId: true,
    },
  });

  if (!team) {
    throw notFound();
  }

  return team;
};
