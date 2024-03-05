import { Box, Breadcrumbs } from '@mui/material';
import { Outlet, UIMatch, useMatches } from '@remix-run/react';
import T from '~/i18n/T';

import { last } from 'underscore';
import { BreadcrumbLink } from '~/components/BreadcrumbLink';

export const handle = {
  breadcrumb: ({ match, isLeaf }: { match: UIMatch; isLeaf: boolean }) => {
    return (
      <BreadcrumbLink to="/organizations" isLeaf={isLeaf}>
        <T>Organizations</T>
      </BreadcrumbLink>
    );
  },
};

export default function OrganizationsRoot() {
  const matches = useMatches();

  return (
    <>
      <Box mt={4}>
        <Breadcrumbs>
          {matches
            // TODO fix these type issues someday
            // @ts-expect-error
            .filter((m) => m.handle?.breadcrumb)
            .map((m, i) =>
              // @ts-expect-error
              m.handle.breadcrumb({
                match: m,
                // @ts-expect-error
                isLeaf: m === last(matches.filter((m) => m.handle?.breadcrumb)),
              }),
            )
            .flat()}
        </Breadcrumbs>

        <Outlet />
      </Box>
    </>
  );
}
