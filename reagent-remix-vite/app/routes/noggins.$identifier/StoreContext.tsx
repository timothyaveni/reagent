import { createContext } from 'react';
import { WebsocketProvider } from 'y-websocket';
import { NogginEditorStore } from '~/routes/noggins.$identifier.edit/noggin-editor/store.client';

// todo dedup types
export const StoreContext = createContext<{
  store: NogginEditorStore | null;
  hasPopulatedStore: boolean;
  websocketProvider: WebsocketProvider | null;
}>({
  store: null,
  hasPopulatedStore: false,
  websocketProvider: null,
});
