import * as Y from 'yjs';

// yncedStore({
//   promptDocuments: {} as {
//     [key: string]: Y.XmlText;
//   },
//   documentParameters: {} as {
//     [key: string]: Y.Map<{
//       name: string;
//       maxLength: number;
//     }>;
//   },
//   // using Object.keys on documentParameters doesn't trigger a rerender on the index component, so we also keep a list of IDs so that the `push` gets noticed by the rerender logic...
//   documentParameterIdsByDocument: {} as {
//     [key: string]: string[];
//   },
//   options: {} as {
//     jsonMode: boolean;
//   },
// });

// store.promptDocuments['editor1'] = new Y.XmlText();
// store.promptDocuments['editor2'] = new Y.XmlText();
// // so, we need to set a default jsonMode if it's not already set after yjs syncs, but we don't want to do it prematurely in case there *is* something to sync
// // (in the real world, the race condition doesn't matter bc the default is just coming from the same place in the backend db)
// // if we don't set a default then we get in trouble trying to render the component

// store.documentParameterIdsByDocument['editor1'] = [];
// store.documentParameterIdsByDocument['editor2'] = [];

export const serializeYDoc = (ydoc: Y.Doc) => {
  // const uint8Array = Y.encodeStateVector(ydoc);
  // const buffer = Buffer.from(uint8Array);
  // return buffer.toString('base64');
  // const obj = {};
  // for (const key of ydoc.share.keys()) {
  //   obj[key] = ydoc.get(key).toJSON();
  // }
  // return JSON.stringify(obj);
  // const uint8Array = Y.encodeSnapshot(Y.snapshot(ydoc));
  // const buffer = Buffer.from(uint8Array);
  // return buffer.toString('base64');

  const buffer = Buffer.from(Y.encodeStateAsUpdate(ydoc));
  return buffer;
  // return buffer.toString('base64');
};

export const createNogginYjsDoc = async (): Promise<Y.Doc> => {
  const yDoc = new Y.Doc();

  const promptDocuments = yDoc.getMap('promptDocuments');
  promptDocuments.set('editor1', new Y.XmlText());
  promptDocuments.set('editor2', new Y.XmlText());

  const documentParameters = yDoc.getMap('documentParameters');
  
  const documentParameterIdsByDocument = yDoc.getMap('documentParameterIdsByDocument');
  documentParameterIdsByDocument.set('editor1', new Y.Array());
  documentParameterIdsByDocument.set('editor2', new Y.Array());

  const options = yDoc.getMap('options');

  return yDoc;
};