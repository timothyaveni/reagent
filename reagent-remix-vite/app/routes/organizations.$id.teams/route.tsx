import { Outlet, UIMatch } from '@remix-run/react';

export const handle = {
  breadcrumb: ({ match, isLeaf }: { match: UIMatch; isLeaf: boolean }) => {
    return 'Teams'; // TODO
  },
};

export default function TeamParent() {
  return <Outlet />;
}
