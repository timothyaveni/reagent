import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from '@remix-run/node';
import { useEffect, useState } from 'react';
import { requireUser } from '~/auth/auth.server';
import { loadNogginBySlug } from '~/models/noggin.server';

import jwt from 'jsonwebtoken';

import { JWT_PRIVATE_KEY } from 'jwt/y-websocket-es512-private.pem.json';
import { notFound } from '~/route-utils/status-code';
import { Outlet, useLoaderData, useRevalidator } from '@remix-run/react';
import EditorHeader from './EditorHeader';
import { initializeStoreForNoggin, NogginEditorStore } from '~/routes/noggins.$identifier.edit/text-completion/store.client';
import { WebsocketProvider } from 'y-websocket';
import { StoreContext } from './StoreContext';

export const meta: MetaFunction = () => {
  return [
    // TODO prob just remove this block
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
      expiresIn: '30m',
    },
  );

  console.log({ authToken });

  return json({ noggin, authToken });
};

const WebsocketConnectedEditor = ({
  noggin,
  authToken,
}: {
  noggin: any; // TODO
  authToken: string;
}) => {
  const [storeAndWebsocketProvider, setStoreAndWebsocketProvider] = useState<{
    store: NogginEditorStore | null;
    websocketProvider: WebsocketProvider | null;
  }>({
    store: null,
    websocketProvider: null,
  });

  const revalidator = useRevalidator();

  useEffect(() => {
    // initializeStoreForNoggin is in a .client file, so it will be undefined on SSR, but the useEffect doesn't run anyway
    // todo: kill old websocket on param change. but not when we just go to a subpage
    const { store, websocketProvider } = initializeStoreForNoggin(
      {
        id: noggin.id,
      },
      authToken,
      revalidator.revalidate,
    );

    console.log('store useeffect');
    setStoreAndWebsocketProvider({ store, websocketProvider });
  }, [noggin.id, authToken]);

  return (
    <StoreContext.Provider value={storeAndWebsocketProvider}>
      <Outlet />
    </StoreContext.Provider>
  );
};

export default function EditorPage() {
  const { noggin, authToken, editorSchema } = useLoaderData<typeof loader>();

  return (
    <>
      <EditorHeader noggin={noggin} />
      <WebsocketConnectedEditor noggin={noggin} authToken={authToken} />
    </>
  );
}
