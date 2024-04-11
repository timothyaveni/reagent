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
      members: {
        select: {
          id: true,
          userInfo: {
            select: {
              displayName: true,
            },
          },
        },
      },
    },
  });

  if (!team) {
    throw notFound();
  }

  return team;
};

export const mayAddMembers = async (
  context: AppLoadContext,
  teamId: number,
): Promise<boolean> => {
  const team = await prisma.team.findUnique({
    where: {
      id: teamId,
    },
    select: {
      organizationId: true,
    },
  });

  if (!team) {
    throw notFound();
  }

  // hm, should we have a non-enforcing version of this?
  try {
    await requireAtLeastUserOrganizationRole(context, {
      organizationId: team.organizationId,
      role: OrganizationRole.MANAGER,
    });
  } catch (e) {
    return false;
  }

  return true;
};

export const getAddableMembersForTeam = async (
  context: AppLoadContext,
  teamId: number,
) => {
  const team = await prisma.team.findUnique({
    where: {
      id: teamId,
    },
    select: {
      organizationId: true,
    },
  });

  if (!team) {
    throw notFound();
  }

  await requireAtLeastUserOrganizationRole(context, {
    organizationId: team.organizationId,
    role: OrganizationRole.MANAGER,
  });

  const members = await prisma.user.findMany({
    where: {
      organizations: {
        some: {
          id: team.organizationId,
        },
      },
      NOT: {
        teams: {
          some: {
            id: teamId,
          },
        },
      },
    },
    select: {
      id: true,
      userInfo: {
        select: {
          displayName: true,
        },
      },
    },
  });

  return members;
};

export const addMemberToTeam = async (
  context: AppLoadContext,
  {
    teamId,
    userId,
  }: {
    teamId: number;
    userId: number;
  },
) => {
  const team = await prisma.team.findUnique({
    where: {
      id: teamId,
    },
    select: {
      organizationId: true,
    },
  });

  if (!team) {
    throw notFound();
  }

  await requireAtLeastUserOrganizationRole(context, {
    organizationId: team.organizationId,
    role: OrganizationRole.MANAGER,
  });

  // this is not a db-enforced constraint -- when we get into deletions, this may cause a problem
  await prisma.organizationMembership.findUniqueOrThrow({
    where: {
      organizationId_userId: {
        organizationId: team.organizationId,
        userId,
      },
    },
  });

  await prisma.team.update({
    where: {
      id: teamId,
    },
    data: {
      members: {
        connect: {
          id: userId,
        },
      },
    },
  });
};

export const getAllTeamsForUser = async (context: AppLoadContext) => {
  const user = requireUser(context);

  const teams = await prisma.team.findMany({
    where: {
      members: {
        some: {
          id: user.id,
        },
      },
    },
    select: {
      id: true,
      name: true,
      organizationId: true,
    },
    orderBy: {
      id: 'asc',
    },
  });

  return teams;
};
