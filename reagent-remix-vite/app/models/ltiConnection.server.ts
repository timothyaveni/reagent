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
