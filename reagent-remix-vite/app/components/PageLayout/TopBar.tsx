import { AppBar, Box, Stack, Link as StyledLink } from '@mui/material';
import T from '~/i18n/T';
import MUILink from '../MUILink';
import ReagentWordmark from './ReagentWordmark';
import './TopBar.css';

export default function TopBar() {
  // <div className="top-bar">
  const linkStyle = {
    marginRight: 6,
    color: '#444',
    fontSize: '1.2rem',
    fontWeight: 700,
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: 'white',
        padding: 1.5,
        marginBottom: 4,
      }}
      elevation={3}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        {/* <div className="site-title"> */}
        <ReagentWordmark />
        {/* </div> */}
        <nav>
          <Box flexDirection={'row'} display={'flex'} alignItems={'center'}>
            <MUILink to="/providers" sx={linkStyle} underline="none">
              <T>Providers</T>
            </MUILink>
            <MUILink to="/organizations" sx={linkStyle} underline="none">
              <T>Organizations</T>
            </MUILink>
            <MUILink to="/noggins" sx={linkStyle} underline="none">
              <T>Noggins</T>
            </MUILink>
            <StyledLink href="/logout" sx={linkStyle} underline="none">
              <T>Log out</T>
            </StyledLink>
          </Box>
        </nav>
      </Stack>
    </AppBar>
  );
  // </div>
}
