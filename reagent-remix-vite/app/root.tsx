import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';

import './styles/global.css';
import { PageLayout } from './components/PageLayout';
import { ContextType } from 'server-types';
import { LoaderFunctionArgs, json } from '@remix-run/node';

export const loader = async ({
  context
}: LoaderFunctionArgs) => {
  console.log('context', context);
  if (context.user) {
    return json({ loggedIn: true });
  } else {
    return json({ loggedIn: false });
  }
};

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
        <PageLayout loggedIn={loggedIn}>
          <Outlet />
        </PageLayout>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
