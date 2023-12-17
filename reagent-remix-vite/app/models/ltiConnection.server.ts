import { AppLoadContext } from '@remix-run/node';
import { requireUserOrganizationRole } from './organization.server';
import { OrganizationRole } from '~/shared/organization';

import prisma from '~/db';
import { v4 as uuid } from 'uuid';

export const createNewLTIConnection = async (
  context: AppLoadContext,
  {
    orgId,
  }: {
    orgId: number;
  },
) => {
  await requireUserOrganizationRole(context, {
    organizationId: orgId,
    role: OrganizationRole.OWNER,
  });

  // unique constraint on database prevents us from needing to check for dupes
  return await prisma.lTIv1p3Connection.create({
    data: {
      consumerKey: uuid(),
      consumerSecret: uuid(),
      organizationId: orgId,
    },
  });
};

export const getLTIConnectionNameWithOrgNameAndId_OMNISCIENT = async ({
  connectionId,
}: {
  connectionId: number;
}) => {
  const connection = await prisma.lTIv1p3Connection.findUnique({
    where: {
      id: connectionId,
    },
    select: {
      lastSeenConsumerName: true,
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!connection) {
    throw new Error('Connection not found');
  }

  return {
    connectionName: connection.lastSeenConsumerName,
    orgName: connection.organization.name,
    orgId: connection.organization.id,
  };
};
