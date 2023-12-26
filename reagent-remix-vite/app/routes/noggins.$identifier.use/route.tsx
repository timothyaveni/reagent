import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import axios from 'axios';
import { requireUser } from '~/auth/auth.server';
import { loadNogginBySlug } from '~/models/noggin.server';
import { createOrGetPrimaryUINogginAPIKey_OMNIPOTENT } from '~/models/nogginApiKey.server';
import { notFound } from '~/route-utils/status-code';
import NewRunForm from './NewRunForm';

export const loader = async ({ params, context }: any) => {
  const user = requireUser(context);

  const { identifier } = params;

  const noggin = await loadNogginBySlug(context, { slug: identifier });

  if (!noggin) {
    throw notFound();
  }

  const uiApiKey = await createOrGetPrimaryUINogginAPIKey_OMNIPOTENT(
    context,
    noggin.id,
  );

  return json({
    NOGGIN_SERVER_EXTERNAL_URL: process.env.NOGGIN_SERVER_EXTERNAL_URL,
    noggin,
    uiApiKey,
  });
};

export const action = async ({ request, params, context }: any) => {
  const user = requireUser(context);

  const { identifier } = params;

  // TODO we can simplify this a bit once we authenticate the below code properly
  const noggin = await loadNogginBySlug(context, { slug: identifier });

  if (!noggin) {
    throw notFound();
  }

  const uiApiKey = await createOrGetPrimaryUINogginAPIKey_OMNIPOTENT(
    context,
    noggin.id,
  );

  const { NOGGIN_SERVER_INTERNAL_URL } = process.env;

  // TODO hm random thought i feel like it could happen that a param is `number | string` which we can't distinguish in formdata but we could in json...
  const bodyParams = new URLSearchParams(request.body);
  const filteredParams: Record<string, string> = {};
  for (const [key, value] of bodyParams.entries()) {
    if (key.startsWith('_reagent_param_')) {
      filteredParams[key.slice('_reagent_param_'.length)] = value;
    }
  }

  const response = await axios.post(
    `${NOGGIN_SERVER_INTERNAL_URL}/${noggin.slug}/create`,
    filteredParams,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${uiApiKey}`,
      },
    },
  );

  // TODO some reason after this redirect clicking 'use' tab doesn't connect us to the ws
  return redirect(`/noggins/${noggin.slug}/use/${response.data.message}`);
};

export default function UseNoggin() {
  const { NOGGIN_SERVER_EXTERNAL_URL, noggin, uiApiKey } =
    useLoaderData<typeof loader>();

  return (
    <div>
      <NewRunForm />
    </div>
  );
}
