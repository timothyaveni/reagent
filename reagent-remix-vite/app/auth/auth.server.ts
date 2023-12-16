import { redirect } from '@remix-run/node';

export const requireUser = (context: {
  user?: { id: number };
}) => {
  const { user } = context;

  if (!user) {
    throw redirect("/");
  }

  return user;
}