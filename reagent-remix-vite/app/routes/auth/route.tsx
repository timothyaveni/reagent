import { Outlet } from '@remix-run/react';

import './AuthWrapper.css';
import ReagentWordmark from '~/components/PageLayout/ReagentWordmark';

export default function AuthWrapper() {
  return (
    <div className="auth-bg">
      <div className="auth-wrapper">
        <ReagentWordmark />
        <div className="auth-wrapper-inner">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
