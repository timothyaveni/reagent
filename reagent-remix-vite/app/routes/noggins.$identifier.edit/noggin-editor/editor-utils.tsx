import { Node, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { uniq } from 'underscore';
import { ParameterNode } from './editor-types';

import { Y, getYjsValue, observeDeep } from '@syncedstore/core';
import { useSyncedStore } from '@syncedstore/react';
import { useContext, useEffect, useRef, useState } from 'react';
import { DocumentParameter } from 'reagent-noggin-shared/types/DocType';
import { v4 as uuid } from 'uuid';
import { StoreContext } from '~/routes/noggins.$identifier/StoreContext';
import { NogginEditorStore } from './store.client';

export const useEditorStore = () => {
  const { store } = useContext(StoreContext);

  if (!store) {
    throw new Error('trying to render a null store');
  }

  return store;
};

export const useRootHasPopulatedStore = (store: any) => {
  const [hasPopulatedStore, setHasPopulatedStore] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (store) {
      if (store.syncState?.synced) {
        setHasPopulatedStore(true);
      } else {
        setHasPopulatedStore(false);
        unsubscribeRef.current = observeDeep(store, () => {
          if (store.syncState?.synced) {
            // a little awkward. we need all the keys to be present in the syncedStore default value, meaning we need to peer into an object here to see if we got a field from the backend
            setHasPopulatedStore(true);
            if (unsubscribeRef.current) {
              unsubscribeRef.current();
              unsubscribeRef.current = null;
            }
          }
        });
      }
    } else {
      setHasPopulatedStore(false);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [store]);

  return hasPopulatedStore;
};

export const useHasPopulatedStore = () => {
  const { hasPopulatedStore } = useContext(StoreContext);
  return hasPopulatedStore;
};

export type EditorParametersList = {
  id: string;
  parameter: DocumentParameter;
}[];
export const useEditorParameters = (): EditorParametersList => {
  // for parameters synced to documentParameters in the store
  const store = useEditorStore();
  const parameterMap = useSyncedStore(store.documentParameters); // this includes orphaned parameters
  const parameterIdsByDocument = useSyncedStore(
    store.documentParameterIdsByDocument, // actually i think we have to use this so it invalidates, like we saw before
  );

  const seenIds = new Set<string>();
  const parameters: EditorParametersList = [];
  for (const documentId of Object.keys(parameterIdsByDocument)) {
    const parameterIds = parameterIdsByDocument[documentId] || [];
    for (const parameterId of parameterIds) {
      if (!seenIds.has(parameterId)) {
        parameters.push({
          id: parameterId,
          parameter: parameterMap[parameterId] as unknown as DocumentParameter,
        });
        seenIds.add(parameterId);
      }
    }
  }

  return parameters;
};

export const getParameterElements = (editor: ReactEditor) => {
  return [...Node.nodes(editor)]
    .filter(([node, path]: [any, number[]]) => {
      return node.type === 'parameter';
    })
    .map(([node, path]: [any, number[]]) => {
      return node as ParameterNode;
    });
};

export const addNewParameter = (
  store: NogginEditorStore,
  editor: ReactEditor,
) => {
  // todo: do this with the store's parameters, not the editor's
  const existingParameterIds = uniq(
    Object.values(store.documentParameterIdsByDocument).flat(),
  );
  let newIndex = existingParameterIds.length + 1;
  // so, this is a little awkward, because it's using the map to check for collisions, but probably that's a good thing so we don't get collisions with hidden un-GC'd params -- even though that's probably not a big deal -- anyway, we'll fix this with TODO(param-sync)
  while (
    Object.values(store.documentParameters).some(
      // @ts-ignore
      (p) => p?.name === `var${newIndex}`,
    )
  ) {
    newIndex++;
  }

  const id = uuid();

  store.documentParameters[id] = new Y.Map([
    ['name', `var${newIndex}`],
    ['type', 'text'],
    ['maxLength', 500],
    ['defaultValue', ''],
  ]);
  // @ts-ignore
  // name: `param${newIndex}`,
  // maxLength: 500,
  // };

  Transforms.insertNodes(editor, {
    type: 'parameter',
    parameterId: id,
    children: [{ text: '' }],
    // TODO(param-sync)
    // parameterOptions: {
    //   name: `param${newIndex}`,
    //   maxLength: 500,
    // },
  } as ParameterNode);

  Transforms.move(editor);
};

// not to be used for slate editors -- those are complex
export function useInputValueState<T>(inputKey: string) {
  const store = useEditorStore();
  const modelInputs = useSyncedStore(store.modelInputs);
  const inputValue = modelInputs[inputKey];
  // const value: T = modelInputs[inputKey].value; // why do i need .value ???? -- i think it's because this isn't a yjs value -- the way syncedstore does automatically
  // okay, i think i get it now -- https://syncedstore.org/docs/advanced/boxed -- maps are boxed, but syncedStore sees that this value from the server is not a YMap so assumes this one was boxed -- but other data types are not boxed. maybe we should do something about this before launch...
  const value = inputValue.value ?? inputValue;
  const modelInputsYjsDoc = getYjsValue(store.modelInputs)! as Y.Map<T>; // not really sure why i need to manually call set() but i don't want to think too hard about it right now

  return [value, (v: T) => modelInputsYjsDoc.set(inputKey, v)] as const;
}
