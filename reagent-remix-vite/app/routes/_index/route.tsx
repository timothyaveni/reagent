import { redirect, type MetaFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { ContextType } from 'server-types';

import T from "~/i18n/T";

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ];
};

export const loader = ({ context }: { context: ContextType }) => {
  if (context.user) {
    return redirect('/noggins');
  }
  return null;
};

export default function Index() {
  return (
    <div className="splash-page">
      <div className="splash-content">
        <h1 className="splash-title">
          <T>reagent</T>
        </h1>
        <Link to="/auth/login" className="splash-button">
          <T>Log in</T>
        </Link>
      </div>
    </div>
  );
}
