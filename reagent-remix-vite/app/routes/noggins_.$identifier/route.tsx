import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from '@remix-run/node';
import Editor from '../../noggin-editor/text-completion/Editor.client';
import { useEffect, useState } from 'react';
import { requireUserPreservingPath } from '~/auth/auth.server';
import { loadNogginBySlug } from '~/models/noggin.server';

import jwt from 'jsonwebtoken';

import { JWT_PRIVATE_KEY } from 'jwt/y-websocket-es512-private.pem.json';
import { notFound } from '~/route-utils/status-code';
import { useLoaderData } from '@remix-run/react';
import { CircularProgress } from '@mui/material';
import EditorHeader from './EditorHeader';

export const meta: MetaFunction = () => {
  return [
    // TODO prob just remove this block
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ];
};

export const loader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  const user = requireUserPreservingPath(request, context);
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
      expiresIn: '30m',
    },
  );

  console.log({ authToken });

  return json({ noggin, authToken });
};

const RemixEditorWrapper = ({
  noggin,
  authToken,
}: {
  noggin: any; // TODO
  authToken: string;
}) => {
  // dude this is SO INCREDIBLY not a vibe
  // but i'm having a couple bundler problems with the editor on the server
  // and dude. i really do not need to render this on the server.
  // paranoid it's going to join the websocket room during ssr anyway lol
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <CircularProgress />; // TODO: loading screen
  }

  return <Editor noggin={noggin} authToken={authToken} />;
};

export default function EditorPage() {
  const { noggin, authToken } = useLoaderData<typeof loader>();

  return (
    <>
      <EditorHeader noggin={noggin} />
      <RemixEditorWrapper noggin={noggin} authToken={authToken} />
    </>
  );
}
