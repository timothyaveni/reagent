import { Node, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { ParameterNode } from './editor-types';
import { debounce, uniq } from 'underscore';

import { v4 as uuid } from 'uuid';
import { Y, observeDeep } from '@syncedstore/core';
import { NogginEditorStore } from './store.client';
import { useContext, useEffect, useRef, useState } from 'react';
import { StoreContext } from '~/routes/noggins.$identifier/StoreContext';

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
  }, [store]);

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  });

  return hasPopulatedStore;
};

export const useHasPopulatedStore = () => {
  const { hasPopulatedStore } = useContext(StoreContext);
  return hasPopulatedStore;
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
      (p) => p?.name === `param${newIndex}`,
    )
  ) {
    newIndex++;
  }

  const id = uuid();

  store.documentParameters[id] = new Y.Map([
    ['name', `param${newIndex}`],
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

