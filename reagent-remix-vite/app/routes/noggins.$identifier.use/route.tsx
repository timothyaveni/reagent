import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from '@remix-run/server-runtime';
import axios from 'axios';
import { requireUser } from '~/auth/auth.server';
import { loadNogginBySlug } from '~/models/noggin.server';
import { createOrGetPrimaryUINogginAPIKey_OMNIPOTENT } from '~/models/nogginApiKey.server';
import { getNogginRuns_OMNISCIENT } from '~/models/nogginRuns.server';
import { notFound } from '~/route-utils/status-code';
import NewRunForm from './NewRunForm';
import PastRuns from './PastRuns';

export const loader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  const user = requireUser(context);

  const { identifier } = params;
  // pagination query params
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page')?.toString() || '1', 10) || 1;

  const noggin = await loadNogginBySlug(context, { slug: identifier });

  if (!noggin) {
    throw notFound();
  }

  const uiApiKey = await createOrGetPrimaryUINogginAPIKey_OMNIPOTENT(
    context,
    noggin.id,
  );

  const { runs, runCount, NOGGIN_RUN_PAGE_SIZE } =
    await getNogginRuns_OMNISCIENT(noggin.id, page);

  return json({
    NOGGIN_SERVER_EXTERNAL_URL: process.env.NOGGIN_SERVER_EXTERNAL_URL || '',
    noggin,
    uiApiKey,
    runs,

    page,
    runCount,
    NOGGIN_RUN_PAGE_SIZE,
  });
};

export type NogginUseLoader = typeof loader;

export const action = async ({
  request,
  params,
  context,
}: ActionFunctionArgs) => {
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
  const bodyParams = await request.formData();
  const filteredParams: Record<string, string> = {};
  for (const [key, value] of bodyParams.entries()) {
    if (key.startsWith('_reagent_param_')) {
      filteredParams[key.slice('_reagent_param_'.length)] = value.toString();
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
  const {
    NOGGIN_SERVER_EXTERNAL_URL,
    noggin,
    uiApiKey,
    runs,
    page,
    runCount,
    NOGGIN_RUN_PAGE_SIZE,
  } = useLoaderData<typeof loader>();

  return (
    <div>
      <NewRunForm
        noggin={noggin}
        apiKey={uiApiKey}
        nogginServerUrl={NOGGIN_SERVER_EXTERNAL_URL}
      />
      {/* todo don't render that key */}
      <PastRuns
        nogginIdentifier={noggin.slug}
        page={page}
        runs={runs}
        runCount={runCount}
        runPageSize={NOGGIN_RUN_PAGE_SIZE}
      />
    </div>
  );
}
