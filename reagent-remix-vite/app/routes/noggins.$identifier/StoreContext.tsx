import { createContext } from "react";
import { WebsocketProvider } from "y-websocket";
import { NogginEditorStore } from "~/routes/noggins.$identifier.edit/text-completion/store";

// todo dedup types
export const StoreContext = createContext<{
  store: NogginEditorStore | null;
  websocketProvider: WebsocketProvider | null;
}>({
  store: null,
  websocketProvider: null,
});