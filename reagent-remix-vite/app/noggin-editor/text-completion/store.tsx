import { getYjsDoc, observeDeep, syncedStore } from '@syncedstore/core';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';

export type NogginEditorStore = ReturnType<
  typeof initializeStoreForNoggin
>['store'];

type DocType = {
  promptDocuments: {
    [key: string]: Y.XmlText;
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
  options: {
    jsonMode: boolean;
  };
};

export const initializeStoreForNoggin = (
  noggin: { id: number },
  authToken: string,
) => {
  const yjsDoc = new Y.Doc();
  const store = syncedStore<DocType>({
    promptDocuments: {} as {
      [key: string]: Y.XmlText;
    },
    documentParameters: {} as {
      [key: string]: Y.Map<{
        name: string;
        maxLength: number;
      }>;
    },
    // using Object.keys on documentParameters doesn't trigger a rerender on the index component, so we also keep a list of IDs so that the `push` gets noticed by the rerender logic...
    documentParameterIdsByDocument: {} as {
      [key: string]: string[];
    },
    options: {} as {
      jsonMode: boolean;
    },
  } as DocType, yjsDoc);

  // store.promptDocuments['editor1'] = new Y.XmlText();
  // store.promptDocuments['editor2'] = new Y.XmlText();
  // so, we need to set a default jsonMode if it's not already set after yjs syncs, but we don't want to do it prematurely in case there *is* something to sync
  // (in the real world, the race condition doesn't matter bc the default is just coming from the same place in the backend db)
  // if we don't set a default then we get in trouble trying to render the component

  // store.documentParameterIdsByDocument['editor1'] = [];
  // store.documentParameterIdsByDocument['editor2'] = [];

  observeDeep(store, () => {
    console.log('store changed', JSON.stringify(store));
  });

  const websocketProvider = new WebsocketProvider(
    'ws://localhost:2347',
    // 'wss://ws.dev.rea.gent',
    noggin.id.toString(),
    yjsDoc,
    {
      params: { authToken },
    },
  );

  return { store, websocketProvider };
};
