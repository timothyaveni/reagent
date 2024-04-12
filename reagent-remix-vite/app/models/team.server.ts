import { AppLoadContext } from '@remix-run/server-runtime';
import { prisma } from 'db/db';
import { requireUser } from '~/auth/auth.server';
import { notFound } from '~/route-utils/status-code';
import { OrganizationRole } from '~/shared/organization';
import {
  hasAtLeastUserOrganizationRole,
  requireAtLeastUserOrganizationRole,
} from './organization.server';

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
    select: {
      id: true,
      name: true,
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
    select: {
      id: true,
      name: true,
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

const isUserOnTeam = async (userId: number, teamId: number) => {
  const team = await prisma.team.findUnique({
    where: {
      id: teamId,
    },
    select: {
      members: {
        where: {
          id: userId,
        },
      },
    },
  });

  if (!team) {
    return false;
  }

  return team.members.length > 0;
};

export const userMayParticipateInTeam = async (
  context: AppLoadContext,
  teamId: number,
): Promise<boolean> => {
  const user = requireUser(context);

  if (await isUserOnTeam(user.id, teamId)) {
    return true;
  }

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

  return await hasAtLeastUserOrganizationRole(context, {
    organizationId: team.organizationId,
    role: OrganizationRole.MANAGER,
  });
};

export const requireUserMayParticipateInTeam = async (
  context: AppLoadContext,
  teamId: number,
) => {
  if (!(await userMayParticipateInTeam(context, teamId))) {
    throw notFound();
  }
};

export const loadTeam = async (context: AppLoadContext, teamId: number) => {
  const user = requireUser(context);

  const team = await prisma.team
    .findUnique({
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
        totalPermittedSpendQuastra: true,
      },
    })
    .then((team) => {
      if (!team) {
        return null;
      }

      return {
        ...team,
        totalPermittedSpendQuastra: Number(team.totalPermittedSpendQuastra),
      };
    });

  if (!team) {
    throw notFound();
  }

  if (!(await userMayParticipateInTeam(context, teamId))) {
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

  return await hasAtLeastUserOrganizationRole(context, {
    organizationId: team.organizationId,
    role: OrganizationRole.MANAGER,
  });
};

export const mayManageTeamBudget = async (
  context: AppLoadContext,
  teamId: number,
): Promise<boolean> => {
  const team = await loadTeam(context, teamId);

  return await hasAtLeastUserOrganizationRole(context, {
    organizationId: team.organizationId,
    role: OrganizationRole.MANAGER,
  });
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
      // bleh, these are actually memberships
      organizations: {
        some: {
          organizationId: team.organizationId,
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
      organizations: {
        select: {
          id: true,
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

export const setTeamTotalBudget = async (
  context: AppLoadContext,
  {
    teamId,
    budgetQuastra,
  }: {
    teamId: number;
    budgetQuastra: number;
  },
) => {
  if (!(await mayManageTeamBudget(context, teamId))) {
    throw notFound();
  }

  await prisma.team.update({
    where: {
      id: teamId,
    },
    data: {
      totalPermittedSpendQuastra: budgetQuastra,
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
