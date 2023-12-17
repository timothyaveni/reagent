import { Outlet } from '@remix-run/react';

import './AuthWrapper.css';

export default function AuthWrapper() {
  return (
    <div className="auth-bg">
      <div className="auth-wrapper">
        <h1>reagent</h1>
        <div className="auth-wrapper-inner">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
