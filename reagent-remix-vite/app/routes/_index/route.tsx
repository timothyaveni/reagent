import { redirect, type MetaFunction } from '@remix-run/node';
import { AppLoadContext } from '@remix-run/server-runtime';
import ReagentWordmark from '~/components/PageLayout/ReagentWordmark';

import T from '~/i18n/T';

import { Button, Paper, Stack } from '@mui/material';
import { useNavigate } from '@remix-run/react';
import './Index.css';

export const meta: MetaFunction = () => {
  return [
    { title: 'reagent' },
    {
      name: 'description',
      content:
        'reagent is designed to get you quickly up to speed making prototypes with AI.',
    },
  ];
};

export const loader = ({ context }: { context: AppLoadContext }) => {
  if (context.user) {
    return redirect('/noggins');
  }
  return null;
};

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="splash-page">
      <Paper elevation={4}>
        <Stack spacing={4} alignItems="center" py={6} px={20}>
          <ReagentWordmark />
          <Button onClick={() => navigate('/auth/login')} variant="contained">
            <T>Log in</T>
          </Button>
        </Stack>
      </Paper>
    </div>
  );
}
