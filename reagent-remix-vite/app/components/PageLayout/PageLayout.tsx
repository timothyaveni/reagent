import TopBar from './TopBar';

import './PageLayout.css';

export const PageLayout = ({
  loggedIn,
  children,
}: {
  loggedIn: boolean;
  children: React.ReactNode;
}) => {
  if (loggedIn) {
    return (
      <>
        <TopBar />
        <main>{children}</main>
      </>
    );
  }

  return <div>{children}</div>;
};
