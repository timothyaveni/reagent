import { Link as StyledLink } from '@mui/material';
import { useNavigate } from '@remix-run/react';

export default function MUILink(props: {
  to: string;
  children: React.ReactNode;

  [key: string]: unknown;
}) {
  const navigate = useNavigate();
  const { to, children, ...rest } = props;

  return (
    <StyledLink
      href={to}
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </StyledLink>
  );
}
