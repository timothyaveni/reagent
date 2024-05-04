import TopBar from './TopBar';

import { Box, Stack, Link as StyledLink, Typography } from '@mui/material';
import { useMatches } from '@remix-run/react';
import './PageLayout.css';

export const PageLayout = ({
  loggedIn,
  children,
}: {
  loggedIn: boolean;
  children: React.ReactNode;
}) => {
  const routes = useMatches();
  // @ts-expect-error
  const wide = routes.some((r) => r.handle?.wideLayout);

  if (loggedIn) {
    return (
      <>
        <TopBar />
        <main className={wide ? 'wide' : ''}>{children}</main>
        <footer>
          <Box
            sx={{
              mt: 10,
              mb: 4,
            }}
            textAlign={'center'}
          >
            <Stack>
              <Typography variant="body2" color="textSecondary">
                reagent was built by{' '}
                <StyledLink href="https://timothyaveni.com/">
                  Timothy J. Aveni
                </StyledLink>{' '}
                in the{' '}
                <StyledLink href="https://bid.berkeley.edu/">
                  Berkeley Institute of Design
                </StyledLink>{' '}
                lab at UC Berkeley.
              </Typography>
              <Typography variant="body2" color="textSecondary">
                reagent's source code is available under the AGPLv3 license on{' '}
                <StyledLink href="https://github.com/timothyaveni/reagent">
                  GitHub
                </StyledLink>
                .
              </Typography>
            </Stack>
          </Box>
        </footer>
      </>
    );
  }

  return <div>{children}</div>;
};
