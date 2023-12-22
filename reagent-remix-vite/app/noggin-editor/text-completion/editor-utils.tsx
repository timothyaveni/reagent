import { Node, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { ParameterNode } from './editor-types';
import { debounce, uniq } from 'underscore';

import { v4 as uuid } from 'uuid';
import { Y } from '@syncedstore/core';
import { NogginEditorStore } from './store';
import { useContext, useEffect, useState } from 'react';
import { StoreContext } from './Editor.client';
import { useSyncedStore } from '@syncedstore/react';

export const useEditorStore = () => {
  const { store } = useContext(StoreContext);

  if (!store) {
    throw new Error('trying to render a null store');
  }

  return store;
};

export const useHasPopulatedStore = (storeAndWebsocketProvider: any) => {
  // const storeAndWebsocketProvider = useContext(StoreContext);
  console.log('haspopulatedstore', storeAndWebsocketProvider);

  // if (!storeAndWebsocketProvider.store) {
  //   console.log('no store');
  //   return false;
  // }

  try {
    const { promptDocuments } = useSyncedStore(storeAndWebsocketProvider.store);
    console.log('promptDocuments', promptDocuments);
    if (!promptDocuments) {
      console.log('no promptDocuments');
      return false;
    }
  } catch (e) {
    console.log('error', e);
    return false;
  }

  console.log('haspopulatedstore true');

  return true;

  // const [hasPopulatedStore, setHasPopulatedStore] = useState(false);

  // const store = useSyncedStore(storeAndWebsocketProvider.store);
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
    ['maxLength', 500],
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

const save = async (value: any) => {
  const totalState = {
    editorValue: value,
  };

  console.log('saving', totalState);

  await fetch('http://localhost:2348/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(totalState),
  });
};
export const debouncedSave = debounce(save, 1000);
