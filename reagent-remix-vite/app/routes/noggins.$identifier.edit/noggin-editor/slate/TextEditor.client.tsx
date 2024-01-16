import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, Slate, withReact } from 'slate-react';

import { useSyncedStore } from '@syncedstore/react';

import { withCursors, withYjs, YjsEditor } from '@slate-yjs/core';

import { Box } from '@mui/material';
import { StoreContext } from '~/routes/noggins.$identifier/StoreContext';
import { Cursors } from '../Cursors';
import {
  addNewVariable,
  getVariableElements,
  useEditorStore,
  useHasPopulatedStore,
} from '../editor-utils';
import { withChatElements, withPlainTextElements } from '../editorPlugins';
import { ChatTurn } from './ChatTurn';
import { InlineImage } from './InlineImage';
import './TextEditor.css';
import { TextFragment } from './TextFragment';
import { Variable } from './Variable';

const initialValue: any[] = [];

export type TextEditorProps = {
  documentKey: string;
  textType: 'plain' | 'chat';
  allowImages?: 'none' | 'user' | 'all';
  // className?: string;
  editorHeight?: 'primary' | 'default';
};

const TextEditor = ({
  documentKey,
  textType,
  allowImages = 'none',
  editorHeight,
}: TextEditorProps) => {
  const store = useEditorStore();
  const hasPopulatedStore = useHasPopulatedStore();

  console.log({ store, hasPopulatedStore });

  if (!hasPopulatedStore) {
    // this breaks prop rules, but we're throwing an error anyway -- this is being checked higher in the component tree
    throw new Error('trying to render a null store');
  }

  const { websocketProvider } = useContext(StoreContext);

  if (!websocketProvider) {
    throw new Error('trying to render a null websocket provider');
  }

  const modelInputs = useSyncedStore(store.modelInputs);

  const [hasVariableEditorOpen, setHasVariableEditorOpen] = useState(false);

  const cursorName = localStorage.getItem('cursor-name'); // TODO don't do it like this
  const cursorColor = localStorage.getItem('cursor-color');

  const editor = useMemo(() => {
    const withReagentAugmentations =
      textType === 'chat' ? withChatElements : withPlainTextElements;

    let e = withCursors(
      withYjs(
        withReagentAugmentations(withReact(withHistory(createEditor()))),
        modelInputs[documentKey]!,
      ),
      websocketProvider.awareness,
      {
        data: {
          name: cursorName || 'Anonymous',
          color: cursorColor || '#000000',
        },
      },
    );

    return e;
  }, [modelInputs, modelInputs[documentKey], cursorName, cursorColor]);

  useEffect(() => {
    console.log('editor useeffect');
    YjsEditor.connect(editor);
    return () => YjsEditor.disconnect(editor);
  }, [editor]);

  const renderElement = useCallback((props: any) => {
    switch (props.element.type) {
      case 'parameter':
        return <Variable {...props} />;
      case 'chat-turn':
        return <ChatTurn {...props} />;
      case 'image':
        return <InlineImage {...props} />;
      default:
        return <TextFragment {...props} />;
    }
  }, []);

  // TODO: flow state dump 2023-12-08 17:12 -- need to keep a separate list of ids for each doc and merge for the control section. sync should be just for this doc.
  const syncVariables = useCallback(() => {
    const parameterOptionDict = store.documentParameters;

    const variableElements = getVariableElements(editor);
    for (const element of variableElements) {
      console.log(
        'sync',
        element,
        JSON.stringify(store.documentParameterIdsByDocument[documentKey]),
      );
      if (
        !store.documentParameterIdsByDocument[documentKey]!.includes(
          element.parameterId,
        )
      ) {
        console.log('没有');
        store.documentParameterIdsByDocument[documentKey]!.push(
          element.parameterId,
        );
      }
    }

    // now delete any that are no longer in the editor
    const ids = [...store.documentParameterIdsByDocument[documentKey]!]; // I think we need to pre-compute to avoid the iterator bug
    for (const id of ids) {
      if (!variableElements.some((e) => e.parameterId === id)) {
        // okay, so, the plan is to sync parameter metadata into the editor state so that copy-paste works.
        // this is going to be yucky and i don't want to do it right now.
        // another way to get most of the way there is to just keep metadata around -- this doesn't work if you, like, refresh the page (well, assuming the room gets killed), and it's a memory leak, but at least it works for now.
        // we still won't *render* stale parameters, because we're still splicing old params out of the array, but we secretly keep their metadata in the dict.
        // this isn't the real reason we have a separate array and object (that was to get the damn thing to rerender), but at least it gives us this for free
        // TODO(param-sync)
        // delete store.documentParameters[id];
        store.documentParameterIdsByDocument[documentKey]!.splice(
          store.documentParameterIdsByDocument[documentKey]!.indexOf(id),
          1,
        );
      }
    }
  }, [editor]);

  return (
    <Box
      mt={1}
      mb={2}
      className={
        'slate-wrapper ' +
        (editorHeight === 'primary' ? 'slate-wrapper-main' : '')
      }
    >
      <Slate
        editor={editor}
        initialValue={initialValue}
        onChange={(value) => {
          console.log('onchange', value);
          syncVariables();
        }}
      >
        <Cursors>
          <Editable
            renderElement={renderElement}
            onKeyDown={(event) => {
              if (event.key === '@') {
                event.preventDefault();
                // todo add a menu thing
                addNewVariable(store, editor);
              }
            }}
          />
        </Cursors>
      </Slate>
    </Box>
  );
};

export default TextEditor;
