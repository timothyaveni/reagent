import { Box, Breadcrumbs } from '@mui/material';
import { Outlet, UIMatch, useMatches } from '@remix-run/react';
import T from '~/i18n/T';

import { ActionFunctionArgs, json } from '@remix-run/server-runtime';
import { last } from 'underscore';
import { BreadcrumbLink } from '~/components/BreadcrumbLink';
import {
  acceptInvite,
  rejectInvite,
} from '~/models/organizationMembership.server';

export const handle = {
  breadcrumb: ({ match, isLeaf }: { match: UIMatch; isLeaf: boolean }) => {
    return (
      <BreadcrumbLink to="/organizations" isLeaf={isLeaf}>
        <T>Organizations</T>
      </BreadcrumbLink>
    );
  },
};

export const action = async ({
  request,
  params,
  context,
}: ActionFunctionArgs) => {
  const formData = await request.formData();

  const action = formData.get('action')?.toString();

  if (action === 'acceptInvite') {
    const inviteIdString = formData.get('inviteId')?.toString();
    if (!inviteIdString) {
      throw new Error('Invalid invite ID');
    }

    const inviteId = parseInt(inviteIdString, 10);

    await acceptInvite(context, { inviteId });
    return json({ success: true });
  } else if (action === 'rejectInvite') {
    const inviteIdString = formData.get('inviteId')?.toString();
    if (!inviteIdString) {
      throw new Error('Invalid invite ID');
    }

    const inviteId = parseInt(inviteIdString, 10);

    await rejectInvite(context, { inviteId });
    return json({ success: true });
  }

  throw new Error('Invalid action');
};

export default function OrganizationsRoot() {
  const matches = useMatches();
  // console.log({ matches: matches.filter((m) => m.handle?.breadcrumb) });

  // @ts-expect-error
  const hideAllBreadcrumbs = last(matches)?.handle?.hideAllBreadcrumbs;

  return (
    <>
      <Box mt={4}>
        {!hideAllBreadcrumbs && (
          <Breadcrumbs>
            {matches
              // TODO fix these type issues someday
              // @ts-expect-error
              .filter((m) => m.handle?.breadcrumb)
              .map((m, i) =>
                // @ts-expect-error
                m.handle.breadcrumb({
                  match: m,
                  isLeaf:
                    // @ts-expect-error
                    m === last(matches.filter((m) => m.handle?.breadcrumb)),
                }),
              )
              .flat()}
          </Breadcrumbs>
        )}

        <Outlet />
      </Box>
    </>
  );
}
