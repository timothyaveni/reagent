import { AppLoadContext } from '@remix-run/node';
import { requireUser } from '~/auth/auth.server';
import prisma from '~/db';

export const MAX_NAME_LENGTH = 255;

export const OrganizationRole = {
  MEMBER: 'member',
  MANAGER: 'manager',
  OWNER: 'owner',
};

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

export const createOrganization = async ({
  ownerId,
  name,
}: {
  ownerId: number;
  name: string;
}) => {
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

export const loadOrganization = async ({
  id,
}: {
  id: number;
}) => {
  const organization = await prisma.organization.findUnique({
    where: {
      id,
    },
  });

  return organization;
}