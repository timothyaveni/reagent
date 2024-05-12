import { redirect } from '@remix-run/node';
import { AppLoadContext } from '@remix-run/server-runtime';

export const requireUser = (context: { user?: { id: number } }) => {
  const { user } = context;

  if (!user) {
    throw redirect('/');
  }

  return user;
};

export const createFakeUserContext_OMNIPOTENT = (user: {
  id: number;
}): AppLoadContext => {
  return {
    user,
    session: {},
    loginNewUser: async () => {},
  };
};
