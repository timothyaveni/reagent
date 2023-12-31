import TopBar from './TopBar';

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
  const wide = routes.some((r) => r.id === 'routes/noggins.$identifier');

  if (loggedIn) {
    return (
      <>
        <TopBar />
        <main className={wide ? 'wide' : ''}>{children}</main>
        <footer
          style={{
            marginTop: 400,
          }}
        >
          by tim
        </footer>
      </>
    );
  }

  return <div>{children}</div>;
};
