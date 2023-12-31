import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from '@remix-run/node';
import { useEffect, useState } from 'react';
import { loadNogginBySlug } from '~/models/noggin.server';

import jwt from 'jsonwebtoken';

import { Outlet, useLoaderData, useRevalidator } from '@remix-run/react';
import { JWT_PRIVATE_KEY } from 'jwt/y-websocket-es512-private.pem.json';
import { WebsocketProvider } from 'y-websocket';
import { notFound } from '~/route-utils/status-code';
import {
  initializeStoreForNoggin,
  NogginEditorStore,
} from '~/routes/noggins.$identifier.edit/noggin-editor/store.client';
import { useRootHasPopulatedStore } from '../noggins.$identifier.edit/noggin-editor/editor-utils';
import EditorHeader from './EditorHeader';
import { StoreContext } from './StoreContext';

export const meta: MetaFunction = () => {
  return [
    // TODO prob just remove this block
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ];
};

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
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

  return json({
    Y_WEBSOCKET_SERVER_EXTERNAL_URL:
      process.env.Y_WEBSOCKET_SERVER_EXTERNAL_URL,
    noggin,
    authToken,
  });
};

export type NogginRouteLoaderType = typeof loader;

const WebsocketConnectedSubpage = () => {
  const { Y_WEBSOCKET_SERVER_EXTERNAL_URL, noggin, authToken } =
    useLoaderData<typeof loader>();
  const [storeAndWebsocketProvider, setStoreAndWebsocketProvider] = useState<{
    store: NogginEditorStore | null;
    websocketProvider: WebsocketProvider | null;
  }>({
    store: null,
    websocketProvider: null,
  });

  const revalidator = useRevalidator();

  useEffect(() => {
    console.log('useEffect', { nogginid: noggin.id, authToken });

    // initializeStoreForNoggin is in a .client file, so it will be undefined on SSR, but the useEffect doesn't run anyway
    // todo: kill old websocket on param change. but not when we just go to a subpage
    const { store, websocketProvider } = initializeStoreForNoggin(
      Y_WEBSOCKET_SERVER_EXTERNAL_URL,
      {
        id: noggin.id,
      },
      authToken,
      revalidator.revalidate,
    );

    console.log('store useeffect');
    setStoreAndWebsocketProvider({ store, websocketProvider });
  }, [noggin.id, authToken]);

  const hasPopulatedStore = useRootHasPopulatedStore(
    storeAndWebsocketProvider.store,
  );

  console.log({ store: storeAndWebsocketProvider.store, hasPopulatedStore });

  return (
    <StoreContext.Provider
      value={{
        ...storeAndWebsocketProvider,
        hasPopulatedStore,
      }}
    >
      <Outlet />
    </StoreContext.Provider>
  );
};

export default function EditorPage() {
  return (
    <>
      <EditorHeader />
      <WebsocketConnectedSubpage />
    </>
  );
}
