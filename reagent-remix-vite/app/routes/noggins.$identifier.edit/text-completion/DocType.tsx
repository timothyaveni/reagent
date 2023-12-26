import * as Y from 'yjs';
import { DocumentParameter } from './store.client';

export type DocType = {
  modelInputs: Record<string, Y.XmlText | any>;
  documentParameters: Record<string, Y.Map<DocumentParameter>>;
  // using Object.keys on documentParameters doesn't trigger a rerender on the index component, so we also keep a list of IDs so that the `push` gets noticed by the rerender logic...
  documentParameterIdsByDocument: {
    [key: string]: string[];
  };
  syncState: {
    synced?: boolean;
  };
};
