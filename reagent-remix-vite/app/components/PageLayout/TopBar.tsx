import { Link } from '@remix-run/react';
import './TopBar.css';
import T from '~/i18n/T';

export default function TopBar() {
  return (
    <div className="top-bar">
      <div className="site-title">reagent</div>

      <nav>
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
