import { CardActionArea } from '@mui/material';
import MUILink from './MUILink.js';

export const CardActionAreaLink = ({
  to,
  children,
  ...props
}: {
  to: string;
  children: React.ReactNode;
  [key: string]: any;
}) => (
  <MUILink
    component={CardActionArea}
    sx={{
      textDecoration: 'none',
      color: 'inherit',

      '&:visited': {
        color: 'inherit',
      },
    }}
    to={to}
    {...props}
  >
    {children}
  </MUILink>
);
