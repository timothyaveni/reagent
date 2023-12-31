import { Button } from '@mui/material';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useLoaderData } from '@remix-run/react';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from '@remix-run/server-runtime';
import { createLTIUser } from 'auth/lti';
import T from '~/i18n/T';
import { getLTIConnectionNameWithOrgNameAndId_OMNISCIENT } from '~/models/ltiConnection.server';
import { addUserToOrganization_OMNIPOTENT } from '~/models/organization.server';
import { OrganizationRole } from '~/shared/organization';

export async function loader({ context }: LoaderFunctionArgs) {
  const user = null; // todo
  const { lastLTILaunch } = context.session;

  if (user) {
    throw new Error('User is already logged in'); // this should not have made it to this interstitial
  }

  if (!lastLTILaunch) {
    throw new Error('LTI context is missing');
  }

  const { connectionId } = lastLTILaunch;

  const { connectionName, orgName, orgId } =
    await getLTIConnectionNameWithOrgNameAndId_OMNISCIENT({ connectionId });

  const { user_id } = lastLTILaunch.launchParams;

  if (!user_id) {
    throw new Error('LTI context is missing user_id');
  }

  return json({
    connectionName,
    orgName,
  });
}

export async function action({ context }: ActionFunctionArgs) {
  const { lastLTILaunch } = context.session;

  if (!lastLTILaunch) {
    throw new Error('LTI context is missing');
  }

  const { connectionId } = lastLTILaunch;

  // todo bleh a little much to refetch
  const { orgId } = await getLTIConnectionNameWithOrgNameAndId_OMNISCIENT({
    connectionId,
  });

  const { user_id } = lastLTILaunch.launchParams;

  if (!user_id) {
    throw new Error('LTI context is missing user_id');
  }

  const newUser = await createLTIUser(connectionId, user_id);
  await addUserToOrganization_OMNIPOTENT({
    organizationId: orgId,
    userId: newUser.id,
    role: OrganizationRole.MEMBER,
  });

  // admittedly hacky -- we aren't using `req.login` because we have session middleware installed
  // context.session.user = {
  //   id: newUser.id,
  // };
  await context.loginNewUser({ id: newUser.id });

  return redirect(`/organizations/${orgId}`, {
    headers: {
      'X-Remix-Revalidate': 'yes',
    },
  });
}

export default function NewLTIAccountInterstitial() {
  const { connectionName, orgName } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>
        <T>Welcome!</T>
      </h1>
      <p>
        <T>
          reagent is designed to get you quickly up to speed making prototypes
          with AI.
        </T>
      </p>
      <p>
        {connectionName ? (
          <T flagged>
            You've just logged in from a course site for{' '}
            <strong>{connectionName}</strong>.{' '}
          </T>
        ) : (
          <T>You've just logged in from a course site. </T>
        )}

        <T flagged>
          When you create your account, you will be automatically added to the{' '}
          <strong>{orgName}</strong> organization.
        </T>
      </p>
      <p>
        <Link to="#">
          {/* TODO */}
          <T>I already have another account on reagent</T>
        </Link>
      </p>
      <p>
        <Form method="post">
          <Button type="submit" variant="contained">
            <T>Create an account</T>
          </Button>
        </Form>
      </p>
    </div>
  );
}
