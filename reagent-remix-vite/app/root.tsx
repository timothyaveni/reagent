import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';

import { withEmotionCache } from '@emotion/react';
import { createTheme, ThemeProvider } from '@mui/material';
import { json } from '@remix-run/node';
import { LoaderFunctionArgs } from '@remix-run/server-runtime';
import { useContext, useEffect, useRef } from 'react';
import { PageLayout } from './components/PageLayout/PageLayout';
import ClientStyleContext from './styles/client.context';
import './styles/global.css';
import ServerStyleContext from './styles/server.context';

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
    h1: {
      fontWeight: 700,
      fontSize: '2rem',
      color: '#111',
    },
    h2: {
      fontWeight: 700,
      fontSize: '1.5rem',
      color: '#333',
    },
    h3: {
      fontWeight: 400,
      fontSize: '1.3rem',
      color: '#333',
    },
    h4: {
      fontWeight: 400,
      fontSize: '1.1rem',
      color: '#333',
    },
  },
});

interface DocumentProps {
  children: React.ReactNode;
  title?: string;
}

const Document = withEmotionCache(
  ({ children, title }: DocumentProps, emotionCache) => {
    const serverStyleData = useContext(ServerStyleContext);
    const clientStyleData = useContext(ClientStyleContext);
    const reinjectStylesRef = useRef(true);

    // Only executed on client
    // When a top level ErrorBoundary or CatchBoundary are rendered,
    // the document head gets removed, so we have to create the style tags
    useEffect(() => {
      if (!reinjectStylesRef.current) {
        return;
      }
      // re-link sheet container
      emotionCache.sheet.container = document.head;

      // re-inject tags
      const tags = emotionCache.sheet.tags;
      emotionCache.sheet.flush();
      tags.forEach((tag) => {
        (emotionCache.sheet as any)._insertTag(tag);
      });

      // reset cache to re-apply global styles
      clientStyleData.reset();
      // ensure we only do this once per mount
      reinjectStylesRef.current = false;
    }, [clientStyleData, emotionCache.sheet]);

    // TODO what is title
    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <Meta />
          <Links />
          {serverStyleData?.map(({ key, ids, css }) => (
            <style
              key={key}
              data-emotion={`${key} ${ids.join(' ')}`}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: css }}
            />
          ))}
          <link rel="icon" href="/favicon.png" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          {/* <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" /> */}
          <link
            href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400&family=Roboto+Mono&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    );
  },
);

export default function App() {
  const { loggedIn } = useLoaderData<typeof loader>();

  return (
    <Document>
      <PageLayout loggedIn={loggedIn}>
        <Outlet />
      </PageLayout>
    </Document>
  );
}
