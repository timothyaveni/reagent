import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from '@remix-run/node';
import Editor from '../../noggin-editor/text-completion/Editor.client';
import { useEffect, useState } from 'react';
import { requireUser } from '~/auth/auth.server';
import { loadNogginBySlug } from '~/models/noggin.server';

import jwt from 'jsonwebtoken';

import { JWT_PRIVATE_KEY } from 'jwt/y-websocket-es512-private.pem.json';
import { notFound } from '~/route-utils/status-code';
import { useLoaderData } from '@remix-run/react';

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ];
};

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  const user = requireUser(context);
  const { identifier } = params;

  const noggin = await loadNogginBySlug(context, { slug: identifier });

  if (!noggin) {
    throw notFound();
  }

  const authToken = jwt.sign(
    {
      nogginId: noggin.id,
    },
    JWT_PRIVATE_KEY,
    {
      algorithm: 'ES512',
      expiresIn: '10s',
    },
  );

  return json({ noggin, authToken });
};

const RemixEditorWrapper = () => {
  // dude this is SO INCREDIBLY not a vibe
  // but i'm having a couple bundler problems with the editor on the server
  // and dude. i really do not need to render this on the server.
  // paranoid it's going to join the websocket room during ssr anyway lol
  const [mounted, setMounted] = useState(false);
  const { noggin, authToken } = useLoaderData<typeof loader>();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // TODO: loading screen
  }

  return <Editor noggin={noggin} authToken={authToken} />;
};

export default function Index() {
  return <RemixEditorWrapper />;
}
