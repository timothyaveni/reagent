import { Link } from '@remix-run/react';
import T from '~/i18n/T';
import ReagentWordmark from './ReagentWordmark';
import './TopBar.css';

export default function TopBar() {
  return (
    <div className="top-bar">
      <div className="site-title">
        <ReagentWordmark />
      </div>

      <nav>
        <Link to="/providers">
          <T>Providers</T>
        </Link>
        <Link to="/organizations">
          <T>Organizations</T>
        </Link>
        <Link to="/noggins">
          <T>Noggins</T>
        </Link>
        <a href="/logout">
          <T>Log out</T>
        </a>
      </nav>
    </div>
  );
}
