import { ActionFunctionArgs, json } from '@remix-run/server-runtime';
import { loadProvisionalNoggin } from '~/models/noggin.server.js';

export const loader = async ({
  request,
  context,
  params,
}: ActionFunctionArgs) => {
  const { provisionalNogginId } = params;

  const provisionalNoggin = await loadProvisionalNoggin(context, {
    id: parseInt(provisionalNogginId || '', 10),
  });

  if (!provisionalNoggin.createdNoggin) {
    return json({
      status: 'NOT_READY',
    });
  }

  // TODO maybe make sure there's a revision
  // normally we don't tell the user the slug until we have one, but this is a bypass
  // ah, nvm, we only set the provisional noggin link when the revision is created -- we're not poking into the *noggin* table to check

  return json({
    status: 'READY',
    redirect: `/noggins/${provisionalNoggin.createdNoggin.slug}/edit`,
  });
};
