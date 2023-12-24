import { useCallback, useContext, useEffect, useMemo } from 'react';
import { createEditor } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import { withHistory } from 'slate-history';

import { useSyncedStore } from '@syncedstore/react';

import { withCursors, withYjs, YjsEditor } from '@slate-yjs/core';

import './TextEditor.css';
import { Cursors } from '../Cursors';
import { withChatElements, withPlainTextElements } from '../editorPlugins';
import { TextFragment } from './TextFragment';
import { ChatTurn } from './ChatTurn';
import { Parameter } from './Parameter';
import {
  addNewParameter,
  getParameterElements,
  useEditorStore,
} from '../editor-utils';
import { debouncedSave } from '../editor-utils';
import { StoreContext } from '../Editor.client';
import { InlineImage } from './InlineImage';

const initialValue: any[] = [];

type Props = {
  documentKey: string;
  textType: 'plain' | 'chat';
  allowImages?: 'none' | 'user' | 'all';
  className?: string;
};

const TextEditor = ({
  documentKey,
  textType,
  allowImages = 'none',
  className = '',
}: Props) => {
  const store = useEditorStore();
  const { websocketProvider } = useContext(StoreContext);

  if (!websocketProvider) {
    throw new Error('trying to render a null websocket provider');
  }

  const modelInputs = useSyncedStore(store.modelInputs);

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
        return <Parameter {...props} />;
      case 'chat-turn':
        return <ChatTurn {...props} />;
      case 'image':
        return <InlineImage {...props} />;
      default:
        return <TextFragment {...props} />;
    }
  }, []);

  // TODO: flow state dump 2023-12-08 17:12 -- need to keep a separate list of ids for each doc and merge for the control section. sync should be just for this doc.
  const syncParameters = useCallback(() => {
    const parameterOptionDict = store.documentParameters;

    const parameterElements = getParameterElements(editor);
    console.log(
      'pe',
      parameterElements,
      JSON.stringify(store.documentParameterIdsByDocument),
      documentKey,
    );
    for (const element of parameterElements) {
      console.log('sync', element);
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
      if (!parameterElements.some((e) => e.parameterId === id)) {
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
    <div className={'slate-wrapper ' + className}>
      <Slate
        editor={editor}
        initialValue={initialValue}
        onChange={(value) => {
          console.log('onchange', value);
          syncParameters();
          debouncedSave(value);
        }}
      >
        <Cursors>
          <Editable
            renderElement={renderElement}
            onKeyDown={(event) => {
              if (event.key === '@') {
                event.preventDefault();
                // todo add a menu thing
                addNewParameter(store, editor);
              }
            }}
          />
        </Cursors>
      </Slate>
    </div>
  );
};

export default TextEditor;
