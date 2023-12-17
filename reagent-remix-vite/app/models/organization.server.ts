import { AppLoadContext } from '@remix-run/node';
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
}

export const createOrganization = async (context: AppLoadContext, {
  name,
}: {
  name: string;
}) => {
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
};

type OrganizationLoadManagerResponse = {
  id: number;
  name: string;
  userOrganizationRole: 'manager';
  allMembers: number[];
};

type OrganizationLoadOwnerResponse = {
  id: number;
  name: string;
  userOrganizationRole: 'owner';
  allMembers: number[];
  ltiConnection: LTIConnectionOwnerVisibleParams | null;
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
    id: number;
  },
): Promise<OrganizationLoadResponse | null> => {
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
}