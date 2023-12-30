import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LoaderFunctionArgs, json } from '@remix-run/node';
import { PageLayout } from './components/PageLayout/PageLayout';
import './styles/global.css';

export const loader = async ({ context }: LoaderFunctionArgs) => {
  if (context.user) {
    return json({ loggedIn: true });
  } else {
    return json({ loggedIn: false });
  }
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#3d1a96',
    },
  },
  typography: {
    fontFamily: 'Lato, sans-serif',
  },
});

export default function App() {
  const { loggedIn } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" /> */}
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <PageLayout loggedIn={loggedIn}>
            <Outlet />
          </PageLayout>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
