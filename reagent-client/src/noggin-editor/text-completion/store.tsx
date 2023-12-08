import { getYjsDoc, syncedStore } from '@syncedstore/core';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';

export const store = syncedStore({
  promptDocumentContainer: {} as {
    xml: Y.XmlText;
  },
  options: {} as {
    jsonMode: boolean;
  },
});

store.promptDocumentContainer.xml = new Y.XmlText();
// so, we need to set a default jsonMode if it's not already set after yjs syncs, but we don't want to do it prematurely in case there *is* something to sync
// (in the real world, the race condition doesn't matter bc the default is just coming from the same place in the backend db)
// if we don't set a default then we get in trouble trying to render the component

const doc = getYjsDoc(store);
export const websocketProvider = new WebsocketProvider(
  'ws://localhost:2347',
  'reagent-noggin',
  doc,
);
