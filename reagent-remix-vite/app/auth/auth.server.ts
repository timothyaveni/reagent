import { redirect, redirectDocument } from '@remix-run/node';
import { AppLoadContext } from '@remix-run/server-runtime';

export const requireUser = (context: AppLoadContext) => {
  const { user } = context;

  if (!user) {
    throw redirect('/');
  }

  return user;
};

export const requireUserPreservingPath = (
  request: Request,
  context: AppLoadContext,
) => {
  const { user } = context;

  if (!user) {
    const url = new URL(request.url);
    throw redirectDocument('/auth/login?redirect=' + url.pathname);
  }

  return user;
};
