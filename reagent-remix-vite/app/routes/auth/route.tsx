import { Outlet } from '@remix-run/react';

import { Box, Paper } from '@mui/material';
import ReagentWordmark from '~/components/PageLayout/ReagentWordmark';
import './AuthWrapper.css';

export default function AuthWrapper() {
  return (
    <div className="auth-bg">
      <Box alignItems="center" display="flex" flexDirection="column">
        <ReagentWordmark />
        <Paper
          elevation={3}
          sx={{
            mt: 2,
            p: 4,
            width: '100%',
            maxWidth: 480,
          }}
        >
          <Outlet />
        </Paper>
      </Box>
    </div>
  );
}
