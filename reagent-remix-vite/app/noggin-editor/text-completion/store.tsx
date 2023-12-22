import { getYjsDoc, observeDeep, syncedStore } from '@syncedstore/core';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';

export type NogginEditorStore = ReturnType<
  typeof initializeStoreForNoggin
>['store'];

type DocType = {
  modelInputs: {
    [key: string]: Y.XmlText | any;
  };
  documentParameters: {
    [key: string]: Y.Map<{
      name: string;
      maxLength: number;
    }>;
  };
  // using Object.keys on documentParameters doesn't trigger a rerender on the index component, so we also keep a list of IDs so that the `push` gets noticed by the rerender logic...
  documentParameterIdsByDocument: {
    [key: string]: string[];
  };
  syncState: {
    synced?: boolean;
  };
};

let globalWebsocketProvider: WebsocketProvider | null = null;

export const initializeStoreForNoggin = (
  noggin: { id: number },
  authToken: string,
  revalidate: () => void,
) => {
  console.log('initializeStoreForNoggin', noggin, authToken);

  const yjsDoc = new Y.Doc();
  const store = syncedStore<DocType>(
    {
      modelInputs: {},
      documentParameters: {},
      // using Object.keys on documentParameters doesn't trigger a rerender on the index component, so we also keep a list of IDs so that the `push` gets noticed by the rerender logic...
      documentParameterIdsByDocument: {},
      syncState: {},
    } as DocType,
    yjsDoc,
  );

  // expensive debug call lol
  // observeDeep(store, () => {
  //   console.log('store changed', JSON.stringify(store));
  // });

  if (globalWebsocketProvider) {
    globalWebsocketProvider.disconnect();
  }

  const websocketProvider = new WebsocketProvider(
    'ws://localhost:2347',
    // 'wss://ws.dev.rea.gent',
    noggin.id.toString(),
    yjsDoc,
    {
      params: { authToken },
    },
  );

  websocketProvider.on('connection-close', (e: any) => {
    console.log('connection error', e.code);

    // hm, i don't think we can get the error message from the server...
    // let's just check on the client if it looks like the authToken JWT is expired

    const expiry = JSON.parse(window.atob(authToken.split('.')[1])).exp;
    if (!expiry || expiry < Date.now() / 1000 + 60) {
      revalidate();
      websocketProvider.shouldConnect = false; // revalidate will give us a new access token, which reloads our hook and causes the init function to run again. we really do not want it to do its own backoff once it has failed here
    }
  });

  // we really only want one of these running in the tab at once...
  globalWebsocketProvider = websocketProvider;

  return { store, websocketProvider };
};
