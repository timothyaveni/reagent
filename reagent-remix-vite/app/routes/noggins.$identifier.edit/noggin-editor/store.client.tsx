import { syncedStore } from '@syncedstore/core';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';

export type NogginEditorStore = ReturnType<
  typeof initializeStoreForNoggin
>['store'];

type DocumentBaseParameter = {
  name: string;
};

export interface DocumentTextParameter extends DocumentBaseParameter {
  type: 'text';
  maxLength: number;
  defaultValue: string;
}

export interface DocumentImageParameter extends DocumentBaseParameter {
  type: 'image';
  openAI_detail: 'low' | 'high' | 'auto'; // openai-centric for now. also maybe in the future we do our own scaling in the shim?
}

export type DocumentParameter = DocumentTextParameter | DocumentImageParameter;
type _DPTypeCheck = DocumentParameter['type'];

type DocType = {
  modelInputs: Record<string, Y.XmlText | any>;
  documentParameters: Record<string, Y.Map<DocumentParameter>>;
  // using Object.keys on documentParameters doesn't trigger a rerender on the index component, so we also keep a list of IDs so that the `push` gets noticed by the rerender logic...
  documentParameterIdsByDocument: Record<string, string[]>;
  nogginOptions: {
    chosenOutputFormatKey: string;
  };
  syncState: {
    synced?: boolean;
  };
};

let globalWebsocketProvider: WebsocketProvider | null = null;

export const initializeStoreForNoggin = (
  Y_WEBSOCKET_SERVER_EXTERNAL_URL: string,
  noggin: { id: number },
  authToken: string,
  revalidate: () => void,
) => {
  const rng = Math.random();
  console.log('initializeStoreForNoggin', noggin, authToken, rng);

  const yDoc = new Y.Doc();
  const store = syncedStore<DocType>(
    {
      modelInputs: {},
      documentParameters: {},
      // using Object.keys on documentParameters doesn't trigger a rerender on the index component, so we also keep a list of IDs so that the `push` gets noticed by the rerender logic...
      documentParameterIdsByDocument: {},
      nogginOptions: {},
      syncState: {},
    } as DocType,
    yDoc,
  );

  // expensive debug call lol
  // observeDeep(store, () => {
  //   console.log('store changed', JSON.stringify(store));
  // });

  if (globalWebsocketProvider) {
    globalWebsocketProvider.disconnect();
  }

  const websocketProvider = new WebsocketProvider(
    Y_WEBSOCKET_SERVER_EXTERNAL_URL,
    noggin.id.toString(),
    yDoc,
    {
      params: { authToken },
    },
  );

  websocketProvider.on('connection-close', (e: any) => {
    console.log('connection error', e.code, rng);

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
