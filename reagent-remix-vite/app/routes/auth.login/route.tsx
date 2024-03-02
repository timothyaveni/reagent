import { Box, Button, Typography } from '@mui/material';
import { MetaFunction } from '@remix-run/react';
import T from '~/i18n/T';
import DevLogin from './DevLogin';

export const meta: MetaFunction = () => {
  return [
    { title: 'Log in :: reagent' },
    {
      name: 'description',
      content: 'Log into reagent',
    },
  ];
};

export default function Login() {
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Typography variant="h1">Log in</Typography>

      {/* github login */}
      <Button
        href="/auth/github"
        sx={{ mt: 4, mb: 2 }}
        variant="contained"
        color="primary"
      >
        <T>Log in with GitHub</T>
      </Button>
      {/* <p> */}
      {/* todo: i do not want to deal with the end-of-semester emails -- make them give us an email address */}
      {/* <T>
          If you typically log in through a course site for a class you are
          taking, you'll need to log in through that site again.
        </T> */}
      {/* </p> */}
      <DevLogin />
    </Box>
  );
}
