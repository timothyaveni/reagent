import { AppLoadContext } from '@remix-run/node';
import { getTotalOrganizationSpendForUser_OMNISCIENT } from 'reagent-noggin-shared/cost-calculation/get-noggin-total-incurred-cost';
import { requireUser } from '~/auth/auth.server';
import prisma from '~/db';
import { notFound } from '~/route-utils/status-code';
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
    // User is not a member of this organization
    throw notFound();
  }

  if (!roles.includes(membership.role as OrganizationRole)) {
    // User does not have the required role
    throw notFound();
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

export type OrganizationLoadResponse = {
  id: number;
  name: string;
  userOrganizationRole: 'member' | 'manager' | 'owner';
  totalPermittedSpendQuastra: number | null;
};

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

  return {
    id,
    name: organization.name,
    userOrganizationRole: membership.role,
    totalPermittedSpendQuastra: Number(membership.totalPermittedSpendQuastra),
  };
  // } else {
  //   throw new Error('Invalid organization role');
  // }
  // }
};

export const loadOrganizationMemberList = async (
  context: AppLoadContext,
  {
    organizationId,
  }: {
    organizationId: number;
  },
) => {
  await requireAtLeastUserOrganizationRole(context, {
    organizationId,
    role: OrganizationRole.MANAGER,
  });

  const allMembers = await prisma.organizationMembership.findMany({
    where: {
      organizationId,
    },
    select: {
      user: {
        select: {
          id: true,
          userInfo: {
            select: {
              displayName: true,
            },
          },
        },
      },
      role: true,
      totalPermittedSpendQuastra: true,
    },
  });
  return allMembers;
};

export const loadOrganizationLTIConnection = async (
  context: AppLoadContext,
  {
    organizationId,
  }: {
    organizationId: number;
  },
) => {
  await requireAtLeastUserOrganizationRole(context, {
    organizationId,
    role: OrganizationRole.OWNER,
  });

  const ltiConnection = await prisma.lTIv1p3Connection.findUnique({
    where: {
      organizationId,
    },
    select: {
      id: true,
      consumerKey: true,
      consumerSecret: true,
      lastSeenConsumerName: true,
    },
  });

  return ltiConnection;
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

  await requireAtLeastUserOrganizationRole(context, {
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

  await requireAtLeastUserOrganizationRole(context, {
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

  const { totalPermittedSpendQuastra } = permittedSpend;

  if (totalPermittedSpendQuastra === null) {
    return null;
  }

  const alreadyBudgeted = await getTotalNogginBudgetsForOrganizationAndUser(
    context,
    {
      organizationId,
    },
  );

  return Number(totalPermittedSpendQuastra) - alreadyBudgeted;
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

  await requireAtLeastUserOrganizationRole(context, {
    organizationId,
    role: OrganizationRole.MEMBER,
  });

  const totalSpend = await getTotalOrganizationSpendForUser_OMNISCIENT(prisma, {
    organizationId,
    userId: user.id,
  });

  return Number(totalSpend);
};

export const getEnabledAIModelIDsForOrganization = async (
  context: AppLoadContext,
  {
    organizationId,
  }: {
    organizationId: number;
  },
) => {
  await requireAtLeastUserOrganizationRole(context, {
    organizationId,
    role: OrganizationRole.MEMBER,
  });

  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
    include: {
      enabledAIModels: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!organization) {
    throw new Error('Organization not found');
  }

  return organization.enabledAIModels.map((model) => model.id);
};

export const enableAIModelForOrganization = async (
  context: AppLoadContext,
  {
    organizationId,
    modelId,
  }: {
    organizationId: number;
    modelId: number;
  },
) => {
  await requireAtLeastUserOrganizationRole(context, {
    organizationId,
    role: OrganizationRole.OWNER,
  });

  await prisma.organization.update({
    where: {
      id: organizationId,
    },
    data: {
      enabledAIModels: {
        connect: {
          id: modelId,
        },
      },
    },
  });
};

export const disableAIModelForOrganization = async (
  context: AppLoadContext,
  {
    organizationId,
    modelId,
  }: {
    organizationId: number;
    modelId: number;
  },
) => {
  await requireAtLeastUserOrganizationRole(context, {
    organizationId,
    role: OrganizationRole.OWNER,
  });

  await prisma.organization.update({
    where: {
      id: organizationId,
    },
    data: {
      enabledAIModels: {
        disconnect: {
          id: modelId,
        },
      },
    },
  });
};

export const isModelEnabledForOrganization = async (
  context: AppLoadContext,
  {
    organizationId,
    modelId,
  }: {
    organizationId: number;
    modelId: number;
  },
) => {
  await requireAtLeastUserOrganizationRole(context, {
    organizationId,
    role: OrganizationRole.MEMBER,
  });

  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
    include: {
      enabledAIModels: {
        select: {
          id: true,
        },
        where: {
          id: modelId,
        },
      },
    },
  });

  if (!organization) {
    throw notFound();
  }

  return organization.enabledAIModels.some((model) => model.id === modelId);
};
