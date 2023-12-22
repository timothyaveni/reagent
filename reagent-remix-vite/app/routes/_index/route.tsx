import { redirect, type MetaFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { AppLoadContext } from '@remix-run/server-runtime';
import ReagentWordmark from '~/components/PageLayout/ReagentWordmark';

import T from "~/i18n/T";

import './Index.css';

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ];
};

export const loader = ({ context }: { context: AppLoadContext }) => {
  if (context.user) {
    // mostly the express server should make sure we go where we came from after login, but if they go manually...
    return redirect('/noggins');

    // if (context.session.postLoginRedirect) {
    //   context.session.postLoginRedirect = null;
    //   return redirect(context.session.postLoginRedirect);
    // } else {
    //   return redirect('/noggins');
    // }
  }
  return null;
};

export default function Index() {
  return (
    <div className="splash-page">
      <div className="splash-content">
        <ReagentWordmark />
        <Link to="/auth/login" className="splash-button">
          <T>Log in</T>
        </Link>
      </div>
    </div>
  );
}
