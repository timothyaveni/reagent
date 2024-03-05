import { Typography } from '@mui/material';
import MUILink from './MUILink';

export function BreadcrumbLink({
  to,
  isLeaf,
  children,
}: {
  to: string;
  isLeaf: boolean;
  children: React.ReactNode;
}) {
  if (isLeaf) {
    return <Typography color="text.primary">{children}</Typography>;
  } else {
    return (
      <MUILink to={to} underline="hover">
        {children}
      </MUILink>
    );
  }
}
