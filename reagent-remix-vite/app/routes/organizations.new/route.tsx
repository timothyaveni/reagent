import { Button, TextField } from '@mui/material';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { requireUser } from '~/auth/auth.server';
import { t } from '~/i18n/T';
import { createOrganization } from '~/models/organization.server';
import { MAX_NAME_LENGTH } from '~/shared/organization';

import { ServerRuntimeMetaFunction as MetaFunction } from '@remix-run/server-runtime';
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `Create a new organization :: reagent` },
    {
      name: 'description',
      content: 'Create a new organization',
    },
  ];
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const user = requireUser(context);

  return null;
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const user = requireUser(context);

  const formData = await request.formData();

  const name = formData.get('name')?.toString();
  const errors: Record<string, string> = {};

  if (!name) {
    errors['name'] = 'Required';
  } else if (name.length > MAX_NAME_LENGTH) {
    errors['name'] = 'Too long';
  }

  if (Object.keys(errors).length > 0) {
    return json(
      {
        errors,
      },
      {
        status: 400,
      },
    );
  }

  const organization = await createOrganization(context, {
    name: name!,
  });

  return redirect(`/organizations/${organization.id}`);
};

export default function OrganizationNew() {
  const actionData = useActionData<typeof action>();
  const nameError = actionData?.errors?.['name'];

  return (
    <div>
      <h1>Create new organization</h1>

      <Form method="post" action="/organizations/new">
        <TextField
          label={t('Organization name')}
          type="text"
          id="name"
          name="name"
          error={!!nameError}
          helperText={nameError}
        />

        <Button type="submit">Create</Button>
      </Form>
    </div>
  );
}
