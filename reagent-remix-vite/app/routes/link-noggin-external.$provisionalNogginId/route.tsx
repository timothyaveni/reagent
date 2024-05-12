import { ActionFunctionArgs, json } from '@remix-run/server-runtime';
import { createFakeUserContext_OMNIPOTENT } from '~/auth/auth.server.js';
import {
  convertProvisionalNogginToNoggin_OMNIPOTENT,
  getInitiatorForProvisionalNoggin_OMNISCIENT,
} from '~/models/noggin.server.js';
import { createOrGetPrimaryUINogginAPIKey_OMNIPOTENT } from '~/models/nogginApiKey.server.js';

const respond = (status: number, body: any) =>
  json(body, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });

export const action = async ({
  request,
  params,
  context,
}: ActionFunctionArgs) => {
  // this won't have a login context! it comes from the ether

  const provisionalNogginId = parseInt(params.provisionalNogginId || '', 10); // whoops guess i don't need this

  const { searchParams } = new URL(request.url);
  const linkingCode = searchParams.get('code') || '';

  const { modelProviderName, aiModelName, aiModelRevision, initialRevision } =
    await request.json();

  console.log('modelProviderName', modelProviderName);

  if (!modelProviderName) {
    return respond(400, { error: 'modelProviderName is required' });
  }

  if (!aiModelName) {
    return respond(400, { error: 'aiModelName is required' });
  }

  if (!aiModelRevision) {
    return respond(400, { error: 'aiModelRevision is required' });
  }

  // this is not truly omnipotent -- that's just to scare you -- it requires the linking code to be right
  const noggin = await convertProvisionalNogginToNoggin_OMNIPOTENT({
    linkingCode,
    modelProviderName,
    aiModelName, // we do revalidate that the model is permitted to be used -- but the error isn't great
    aiModelRevision,
    initialRevision: initialRevision ?? null,
  });

  const provisionalInitiatorId =
    await getInitiatorForProvisionalNoggin_OMNISCIENT(provisionalNogginId);

  // okay, this one is actually omnipotent LOL i should revisit that
  const apiKey = await createOrGetPrimaryUINogginAPIKey_OMNIPOTENT(
    // this is kinda sketchy. for now it doesn't really use anything about the user but ehhh
    createFakeUserContext_OMNIPOTENT({
      id: provisionalInitiatorId,
    }),
    noggin.id,
  );

  return respond(201, {
    nogginUrl: `${process.env.NOGGIN_SERVER_EXTERNAL_URL}/${noggin.slug}`,
    nogginKey: apiKey,
  });
};
