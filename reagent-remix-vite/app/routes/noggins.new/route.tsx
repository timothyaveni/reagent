import { LoaderFunctionArgs, json, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { AppLoadContext } from '@remix-run/server-runtime';
import { requireUser } from '~/auth/auth.server';
import { createNoggin } from '~/models/noggin.server';
import { indexOrganizations } from '~/models/organization.server';

import './NewNoggin.css';
import { Autocomplete, Button, Switch, TextField } from '@mui/material';
import T, { t } from '~/i18n/T';
import { indexAIModels } from '~/models/aiModel.server';
import { useState } from 'react';

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const user = requireUser(context);

  const orgs = await indexOrganizations(context);

  const aiModels = await indexAIModels(context);

  return json({ orgs, aiModels });
};

// TODO type
export const action = async ({ request, context }: { request: any; context: AppLoadContext }) => {
  const user = requireUser(context);

  const formData = await request.formData();
  const aiModelIdString = formData.get('aiModelId');
  if (!aiModelIdString) {
    throw new Error('aiModelId is required');
  }

  const aiModelId = parseInt(aiModelIdString,10);

  const name = formData.get('name').toString();

  const noggin = await createNoggin(context, {
    ownerType: 'user',
    ownerId: user.id,
    aiModelId,
    name: name === '' ? null : name,
  });

  return redirect(`/noggins/${noggin.slug}/edit`);
};

export default function NewNoggin() {
  const {
    orgs,
    aiModels,
  }: {
    orgs: any;
    aiModels: Awaited<ReturnType<typeof indexAIModels>>;
  } = useLoaderData<typeof loader>();

  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [nogginOwnershipType, setNogginOwnershipType] = useState<
    'personal' | 'org'
  >('personal');

  return (
    <div className="new-noggin">
      <h1>
        <T>Create a noggin</T>
      </h1>

      <Form method="post">
        <label>
          {/* todo we don't do anything with this */}
          <T>org-owned</T>
          <Switch
            checked={nogginOwnershipType === 'org'}
            onChange={(e) => {
              setNogginOwnershipType(e.target.checked ? 'org' : 'personal');
            }}
          />
        </label>

        <TextField name="name" label={t('Name')} />

        <Autocomplete
          options={aiModels}
          getOptionLabel={(option) =>
            `${option.modelProvider.name}/${option.name}`
          }
          renderInput={(params) => (
            <TextField {...params} label={t('AI Model')} />
          )}
          onChange={(e, value) => {
            setSelectedModelId(value?.id ?? null);
          }}
        />
        <input type="hidden" name="aiModelId" value={selectedModelId ?? ''} />

        <Button type="submit">Create</Button>
      </Form>
    </div>
  );
}
