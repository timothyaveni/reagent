import { AccountCircle, Menu as MenuIcon } from '@mui/icons-material';
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Link as StyledLink,
  Typography,
} from '@mui/material';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { useRef, useState } from 'react';
import T, { t } from '~/i18n/T';
import { RootLoader } from '~/root';
import MUILink from '../MUILink';
import ReagentWordmark from './ReagentWordmark';

export default function TopBar() {
  const { userInfo } = useLoaderData<RootLoader>();
  const [drawerShown, setDrawerShown] = useState(false);
  const anchorEl = useRef<HTMLButtonElement>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleClose = () => setUserMenuOpen(false);

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

  const links: {
    href: string;
    text: string;
    forceReload?: boolean;
  }[] = [
    { href: '/providers', text: t('Providers') },
    { href: '/organizations', text: t('Organizations') },
    { href: '/noggins', text: t('Noggins') },
    // { href: '/logout', text: userInfo?.displayName, forceReload: true }, // todo
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
        <Box sx={{ pl: 2 }}>
          <ReagentWordmark />
        </Box>
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
            <Button
              aria-haspopup="true"
              onClick={() => {
                setUserMenuOpen((userMenuOpen) => !userMenuOpen);
              }}
            >
              <T flagged>{userInfo?.displayName || 'User'}</T>
              <AccountCircle
                sx={{
                  ml: 2,
                  color: 'primary.main',
                }}
              />
            </Button>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl.current}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={userMenuOpen}
              onClose={handleClose}
            >
              <MenuItem
                onClick={() => {
                  handleClose();
                  navigate('/profile/my/edit');
                }}
              >
                Profile
              </MenuItem>
              <MenuItem
                onClick={() => {
                  // need a reload, so no navigate
                  window.location.href = '/logout';
                }}
              >
                Log out
              </MenuItem>
            </Menu>
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
          sx={{
            // todo doesn't seem to work
            maxWidth: '40vw',
          }}
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

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" sx={{ px: 4 }}>
            {userInfo?.displayName ? (
              <T flagged>Logged in as {userInfo.displayName}</T>
            ) : (
              <T>Logged in</T>
            )}
          </Typography>

          <div onClick={() => setDrawerShown(false)}>
            <MUILink
              to="/profile/my/edit"
              sx={drawerLinkStyle}
              underline="none"
            >
              <T>Profile</T>
            </MUILink>
          </div>

          <div onClick={() => setDrawerShown(false)}>
            <StyledLink href={'/logout'} sx={drawerLinkStyle} underline="none">
              <T>Log out</T>
            </StyledLink>
          </div>
        </Drawer>
      </Stack>
    </AppBar>
  );
  // </div>
}
