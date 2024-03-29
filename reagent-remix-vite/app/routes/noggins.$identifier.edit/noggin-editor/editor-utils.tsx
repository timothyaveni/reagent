import { Node, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { uniq } from 'underscore';
import { VariableNode } from './editor-types';

import { Y, getYjsValue, observeDeep } from '@syncedstore/core';
import { useSyncedStore } from '@syncedstore/react';
import { useContext, useEffect, useRef, useState } from 'react';
import { createDocumentVariableForOverride } from 'reagent-noggin-shared/createDocumentVariableForOverride';
import { DocumentVariable } from 'reagent-noggin-shared/types/DocType';
import { EditorSchema } from 'reagent-noggin-shared/types/editorSchema';
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

export type EditorVariablesList = {
  id: string;
  variable: DocumentVariable;
}[];
export const useEditorVariables = (): EditorVariablesList => {
  // for variables synced to documentParameters in the store
  const store = useEditorStore();
  const variableMap = useSyncedStore(store.documentParameters); // this includes orphaned variables
  const variableIdsByDocument = useSyncedStore(
    store.documentParameterIdsByDocument, // actually i think we have to use this so it invalidates, like we saw before
  );

  const seenIds = new Set<string>();
  const variables: EditorVariablesList = [];
  for (const documentId of Object.keys(variableIdsByDocument)) {
    const variableIds = variableIdsByDocument[documentId] || [];
    for (const variableId of variableIds) {
      if (!seenIds.has(variableId)) {
        variables.push({
          id: variableId,
          variable: variableMap[variableId] as unknown as DocumentVariable,
        });
        seenIds.add(variableId);
      }
    }
  }

  return variables;
};

const createDocumentVariableForOverrideWrapper = (
  overrideKey: string,
  editorSchema: EditorSchema,
) => {
  const [defaultValue] = useInputValueState(overrideKey);
  return createDocumentVariableForOverride(
    overrideKey,
    defaultValue,
    editorSchema,
  );
};

export const useEditorVariablesAndOverrides = (
  editorSchema: EditorSchema,
): EditorVariablesList => {
  const store = useEditorStore();
  const variables = useEditorVariables();

  const overrideKeys = useSyncedStore(store.overridableModelInputKeys);

  const overrides: EditorVariablesList = [];

  for (const overrideKey of overrideKeys) {
    overrides.push(
      createDocumentVariableForOverrideWrapper(overrideKey, editorSchema),
    );
  }

  return variables.concat(overrides);
};

export const getVariableElements = (editor: ReactEditor) => {
  return [...Node.nodes(editor)]
    .filter(([node, path]: [any, number[]]) => {
      return node.type === 'parameter';
    })
    .map(([node, path]: [any, number[]]) => {
      return node as VariableNode;
    });
};

export const addNewVariable = (
  store: NogginEditorStore,
  // editor: ReactEditor,
  variableName?: string,
  withUuid?: string,
): string => {
  // todo: do this with the store's parameters, not the editor's
  const existingVariableIds = uniq(
    Object.values(store.documentParameterIdsByDocument).flat(),
  );
  if (
    Object.values(store.documentParameters).some(
      // @ts-expect-error
      (c) => c?.name === variableName,
    )
  ) {
    // shouldn't really happen, but can for now especially because of un-GC'd vars.
    return Object.entries(store.documentParameters).find(
      // @ts-expect-error
      ([id, variable]) => variable?.name === variableName,
    )![0];
  }

  let newName = variableName;
  if (newName === undefined) {
    let newIndex = existingVariableIds.length + 1;
    // so, this is a little awkward, because it's using the map to check for collisions, but probably that's a good thing so we don't get collisions with hidden un-GC'd params -- even though that's probably not a big deal -- anyway, we'll fix this with TODO(param-sync)
    while (
      Object.values(store.documentParameters).some(
        // @ts-ignore
        (p) => p?.name === `var${newIndex}`,
      )
    ) {
      newIndex++;
    }
    newName = `var${newIndex}`;
  }

  const id = withUuid ?? uuid();

  store.documentParameters[id] = new Y.Map([
    ['name', newName],
    ['type', 'text'],
    ['maxLength', 500],
    ['defaultValue', ''],
  ]);
  // @ts-ignore
  // name: `param${newIndex}`,
  // maxLength: 500,
  // };
  return id;
};

export const insertVariableAtCursor = (editor: ReactEditor, id: string) => {
  Transforms.insertNodes(editor, {
    type: 'parameter',
    parameterId: id,
    children: [{ text: '' }],
    // TODO(param-sync)
    // parameterOptions: {
    //   name: `param${newIndex}`,
    //   maxLength: 500,
    // },
  } as VariableNode);

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
