import { AppLoadContext } from '@remix-run/node';
import { getTotalOrganizationSpendForUser_OMNISCIENT } from 'reagent-noggin-shared/cost-calculation/get-noggin-total-incurred-cost';
import { requireUser } from '~/auth/auth.server';
import prisma from '~/db';
import { LTIConnectionOwnerVisibleParams } from '~/shared/ltiConnection';
import { OrganizationRole } from '~/shared/organization';

export const indexOrganizations = async (context: AppLoadContext) => {
  const user = requireUser(context);

  const organizations = await prisma.organization.findMany({
    where: {
      members: {
        some: {
          userId: user.id,
        },
      },
    },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          members: true,
        },
      },
    },
  });

  return organizations;
};

export const requireUserOrganizationRole = async (
  context: AppLoadContext,
  {
    organizationId,
    role,
  }: {
    organizationId: number;
    role: OrganizationRole | OrganizationRole[];
  },
) => {
  const user = requireUser(context);

  const roles = Array.isArray(role) ? role : [role];

  const membership = await prisma.organizationMembership.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId: user.id,
      },
    },
    select: {
      role: true,
    },
  });

  if (!membership) {
    throw new Error('User is not a member of this organization');
  }

  if (!roles.includes(membership.role as OrganizationRole)) {
    throw new Error('User does not have the required role');
  }
};

export const requireAtLeastUserOrganizationRole = async (
  context: AppLoadContext,
  {
    organizationId,
    role,
  }: {
    organizationId: number;
    role: OrganizationRole;
  },
) => {
  // idk this is maybe an antipattern because roles might not be a linear hierarchy
  // but i feel like using the other function is just going to be error-prone
  const orderedRoles = [
    OrganizationRole.MEMBER,
    OrganizationRole.MANAGER,
    OrganizationRole.OWNER,
  ];

  const relevantRoles = orderedRoles.slice(
    orderedRoles.indexOf(role),
    orderedRoles.length,
  );

  await requireUserOrganizationRole(context, {
    organizationId,
    role: relevantRoles,
  });
};

export const createOrganization = async (
  context: AppLoadContext,
  {
    name,
  }: {
    name: string;
  },
) => {
  const owner = requireUser(context);
  const ownerId = owner.id;

  const organization = await prisma.organization.create({
    data: {
      name,
    },
  });

  await prisma.organizationMembership.create({
    data: {
      organizationId: organization.id,
      userId: ownerId,
      role: OrganizationRole.OWNER,
    },
  });

  return organization;
};

type OrganizationLoadMemberResponse = {
  id: number;
  name: string;
  userOrganizationRole: 'member';
  totalPermittedSpendQuastra: number | null;
};

type OrganizationLoadManagerResponse = {
  id: number;
  name: string;
  userOrganizationRole: 'manager';
  allMembers: number[];
  totalPermittedSpendQuastra: number | null;
};

type OrganizationLoadOwnerResponse = {
  id: number;
  name: string;
  userOrganizationRole: 'owner';
  allMembers: number[];
  ltiConnection: LTIConnectionOwnerVisibleParams | null;
  totalPermittedSpendQuastra: number | null;
};

export type OrganizationLoadResponse =
  | OrganizationLoadMemberResponse
  | OrganizationLoadManagerResponse
  | OrganizationLoadOwnerResponse;

export const loadOrganization = async (
  context: AppLoadContext,
  {
    id,
  }: {
    id: number | null;
  },
): Promise<OrganizationLoadResponse | null> => {
  if (id === null) {
    return null;
  }

  const organization = await prisma.organization.findUnique({
    where: {
      id,
    },
    select: {
      name: true,
    },
  });

  if (!organization) {
    return null;
  }

  const user = requireUser(context);

  const membership = await prisma.organizationMembership.findUnique({
    where: {
      organizationId_userId: {
        organizationId: id,
        userId: user.id,
      },
    },
    select: {
      role: true,
      totalPermittedSpendQuastra: true,
    },
  });

  if (!membership) {
    return null;
  }

  if (membership.role === OrganizationRole.MEMBER) {
    return {
      id,
      name: organization.name,
      userOrganizationRole: OrganizationRole.MEMBER,
      totalPermittedSpendQuastra: Number(membership.totalPermittedSpendQuastra),
    };
  } else {
    const allMembers = await prisma.organizationMembership.findMany({
      where: {
        organizationId: id,
      },
      select: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });
    if (membership.role === OrganizationRole.MANAGER) {
      return {
        id,
        name: organization.name,
        userOrganizationRole: OrganizationRole.MANAGER,
        allMembers: allMembers.map(({ user }) => user.id),
        totalPermittedSpendQuastra: Number(
          membership.totalPermittedSpendQuastra,
        ),
      };
    } else if (membership.role === OrganizationRole.OWNER) {
      const ltiConnection = await prisma.lTIv1p3Connection.findUnique({
        where: {
          organizationId: id,
        },
        select: {
          id: true,
          consumerKey: true,
          consumerSecret: true,
          lastSeenConsumerName: true,
        },
      });

      return {
        id,
        name: organization.name,
        userOrganizationRole: OrganizationRole.OWNER,
        allMembers: allMembers.map(({ user }) => user.id),
        ltiConnection: ltiConnection
          ? {
              id: ltiConnection.id,
              consumerKey: ltiConnection.consumerKey,
              consumerSecret: ltiConnection.consumerSecret,
              lastSeenConsumerName: ltiConnection.lastSeenConsumerName,
            }
          : null,
        totalPermittedSpendQuastra: Number(
          membership.totalPermittedSpendQuastra,
        ),
      };
    } else {
      throw new Error('Invalid organization role');
    }
  }
};

export const addUserToOrganization_OMNIPOTENT = async ({
  userId,
  organizationId,
  role = OrganizationRole.MEMBER,
}: {
  userId: number;
  organizationId: number;
  role?: OrganizationRole;
}) => {
  await prisma.organizationMembership.create({
    data: {
      userId,
      organizationId,
      role,
    },
  });
};

export const getTotalNogginBudgetsForOrganizationAndUser = async (
  context: AppLoadContext,
  {
    organizationId,
  }: {
    organizationId: number;
  },
) => {
  const user = requireUser(context);

  requireAtLeastUserOrganizationRole(context, {
    organizationId,
    role: OrganizationRole.MEMBER,
  });

  const totalBudget = await prisma.noggin.aggregate({
    where: {
      parentOrgId: organizationId,
      userOwnerId: user.id,
    },
    _sum: {
      totalAllocatedCreditQuastra: true,
    },
  });

  // todo: we should also probably include a count of unlimited-budget noggins
  return Number(totalBudget._sum?.totalAllocatedCreditQuastra || 0);
};

export const getPermittedAdditionalBudgetForOrganizationAndUser = async (
  context: AppLoadContext,
  {
    organizationId,
  }: {
    organizationId: number;
  },
) => {
  const user = requireUser(context);

  requireAtLeastUserOrganizationRole(context, {
    organizationId,
    role: OrganizationRole.MEMBER,
  });

  const permittedSpend = await prisma.organizationMembership.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId: user.id,
      },
    },
    select: {
      totalPermittedSpendQuastra: true,
    },
  });

  if (permittedSpend === null) {
    return null;
  }

  const alreadyBudgeted = await getTotalNogginBudgetsForOrganizationAndUser(
    context,
    {
      organizationId,
    },
  );

  return Number(permittedSpend.totalPermittedSpendQuastra) - alreadyBudgeted;
};

export const getTotalOrganizationSpendForUser = async (
  context: AppLoadContext,
  {
    organizationId,
  }: {
    organizationId: number;
  },
) => {
  const user = requireUser(context);

  requireAtLeastUserOrganizationRole(context, {
    organizationId,
    role: OrganizationRole.MEMBER,
  });

  const totalSpend = await getTotalOrganizationSpendForUser_OMNISCIENT(prisma, {
    organizationId,
    userId: user.id,
  });

  return Number(totalSpend);
};
