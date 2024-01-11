import { Menu as MenuIcon } from '@mui/icons-material';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Stack,
  Link as StyledLink,
} from '@mui/material';
import { useState } from 'react';
import T, { t } from '~/i18n/T';
import MUILink from '../MUILink';
import ReagentWordmark from './ReagentWordmark';

export default function TopBar() {
  const [drawerShown, setDrawerShown] = useState(false);

  // <div className="top-bar">
  const linkStyle = {
    marginRight: 6,
    color: '#444',
    fontSize: '1.2rem',
    fontWeight: 700,
  };

  const drawerLinkStyle = {
    display: 'block',
    color: '#444',
    fontSize: '1.2rem',
    fontWeight: 700,
    paddingY: 2,
    paddingX: 4,
    textDecoration: 'none',
  };

  const links = [
    { href: '/providers', text: t('Providers') },
    { href: '/organizations', text: t('Organizations') },
    { href: '/noggins', text: t('Noggins') },
    { href: '/logout', text: t('Log out'), forceReload: true },
  ];

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
          <Box
            flexDirection={'row'}
            sx={{
              display: {
                xs: 'none',
                md: 'flex',
              },
            }}
            alignItems={'center'}
          >
            {links.map((link) => {
              if (link.forceReload) {
                return (
                  <StyledLink
                    href={link.href}
                    sx={linkStyle}
                    underline="none"
                    key={link.href}
                  >
                    {link.text}
                  </StyledLink>
                );
              } else {
                return (
                  <MUILink
                    to={link.href}
                    sx={linkStyle}
                    underline="none"
                    key={link.href}
                  >
                    <T>{link.text}</T>
                  </MUILink>
                );
              }
            })}
          </Box>
          <IconButton
            sx={{
              display: {
                xs: 'flex',
                md: 'none',
              },
            }}
            onClick={() => setDrawerShown((drawerShown) => !drawerShown)}
          >
            <MenuIcon />
          </IconButton>
        </nav>

        <Drawer
          variant="temporary"
          open={drawerShown}
          onClose={() => setDrawerShown(false)}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 2,
            }}
          >
            <ReagentWordmark />
          </Box>
          {links.map((link) => {
            if (link.forceReload) {
              return (
                <StyledLink
                  href={link.href}
                  sx={drawerLinkStyle}
                  underline="none"
                  key={link.href}
                >
                  {link.text}
                </StyledLink>
              );
            } else {
              return (
                <div key={link.href} onClick={() => setDrawerShown(false)}>
                  <MUILink to={link.href} sx={drawerLinkStyle} underline="none">
                    <T>{link.text}</T>
                  </MUILink>
                </div>
              );
            }
          })}
        </Drawer>
      </Stack>
    </AppBar>
  );
  // </div>
}
