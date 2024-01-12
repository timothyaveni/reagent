import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from '@remix-run/server-runtime';
import { requireUser } from '~/auth/auth.server';
import { createNoggin } from '~/models/noggin.server';
import { indexOrganizations } from '~/models/organization.server';

import {
  Autocomplete,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ServerRuntimeMetaFunction as MetaFunction } from '@remix-run/server-runtime';
import { useState } from 'react';
import T, { t } from '~/i18n/T';
import { indexAIModels } from '~/models/aiModel.server';
import './NewNoggin.css';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `Create a noggin :: reagent` },
    {
      name: 'description',
      content: `Create a new noggin`,
    },
  ];
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const user = requireUser(context);

  const orgs = await indexOrganizations(context);

  const aiModels = await indexAIModels(context);

  return json({ orgs, aiModels });
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const user = requireUser(context);

  const formData = await request.formData();
  const aiModelIdString = formData.get('aiModelId')?.toString();
  if (!aiModelIdString) {
    throw new Error('aiModelId is required');
  }

  const aiModelId = parseInt(aiModelIdString, 10);

  const name = formData.get('name')?.toString();

  if (name === undefined || name === '') {
    throw new Error('name is required');
  }

  const noggin = await createNoggin(context, {
    ownerType: 'user',
    ownerId: user.id,
    aiModelId,
    name,
  });

  return redirect(`/noggins/${noggin.slug}/edit`);
};

export default function NewNoggin() {
  const { orgs, aiModels } = useLoaderData<typeof loader>();

  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [nogginOwnershipType, setNogginOwnershipType] = useState<
    'personal' | 'org'
  >('personal');

  return (
    <div className="new-noggin">
      <Typography variant="h1" mb={4}>
        <T>Create a noggin</T>
      </Typography>

      <Form method="post">
        {/* todo we don't do anything with this */}
        {/* <label>
          <T>org-owned</T>
          <Switch
            checked={nogginOwnershipType === 'org'}
            onChange={(e) => {
              setNogginOwnershipType(e.target.checked ? 'org' : 'personal');
            }}
          />
        </label> */}
        <Box
          sx={{
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          <Stack spacing={2}>
            <Paper
              sx={{
                p: 4,
              }}
            >
              <Stack spacing={2}>
                <TextField name="name" label={t('Noggin name')} />

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
                <input
                  type="hidden"
                  name="aiModelId"
                  value={selectedModelId ?? ''}
                />
              </Stack>
            </Paper>
            <Box alignSelf="flex-end">
              <Button type="submit" variant="contained">
                Create
              </Button>
            </Box>
          </Stack>
        </Box>
      </Form>
    </div>
  );
}
