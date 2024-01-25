import { Box, Button, TextField } from '@mui/material';
import { Form, useLoaderData, useSubmit } from '@remix-run/react';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
} from '@remix-run/server-runtime';

import { ServerRuntimeMetaFunction as MetaFunction } from '@remix-run/server-runtime';
import T from '~/i18n/T';
import { getUserInfo, setDisplayName } from '~/models/user.server';
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `Edit my profile :: reagent` },
    {
      name: 'description',
      content: `Edit your profile on reagent`,
    },
  ];
};

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  const userInfo = await getUserInfo(context);

  return json({
    userInfo,
  });
};

export const action = async ({
  request,
  params,
  context,
}: ActionFunctionArgs) => {
  const body = new URLSearchParams(await request.text());
  const displayName = body.get('displayName') || '';

  await setDisplayName(context, displayName);

  return json({
    ok: true,
  });
};

export default function EditMyProfile() {
  const { userInfo } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  return (
    <Box mt={4}>
      <h1>My profile</h1>

      <Form method="post" action="/profile/my/edit">
        <Box mb={2}>
          <TextField
            label="Display name"
            name="displayName"
            defaultValue={userInfo?.displayName}
          />
        </Box>
        <Button variant="contained" type="submit">
          <T>Save</T>
        </Button>
      </Form>
    </Box>
  );
}
