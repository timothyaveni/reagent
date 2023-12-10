import { useCallback, useEffect, useMemo } from 'react';
import { createEditor } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import { withHistory } from 'slate-history';

import { useSyncedStore } from '@syncedstore/react';

import { withCursors, withYjs, YjsEditor } from '@slate-yjs/core';

import './TextEditor.css';
import { Cursors } from './Cursors';
import { withChatElements, withPlainTextElements } from './editorPlugins';
import { TextFragment } from './TextFragment';
import { ChatTurn } from './ChatTurn';
import { Parameter } from './Parameter';
import { addNewParameter, getParameterElements } from './editor-utils';
import { debouncedSave } from './editor-utils';
import { store, websocketProvider } from './store';

const initialValue: any[] = [
  // {
  //   children: [{ text: '' }],
  // },
];

type Props = {
  documentKey: string;
  textType: 'plain' | 'chat';
};

const TextEditor = ({ documentKey, textType }: Props) => {
  const promptDocuments = useSyncedStore(store.promptDocuments);
  // const parameterOptions = useSyncedStore(store.parameterOptions); // I thiiink this is a quirk of the library, that we have to do this here instead of in ParameterControls so it will rerender
  // hm, it looks like it might still not be rerendering, especially when there are other (cross-tab comms?) users. it's okay, we're planning to put all this in slate soon. we'll revisit if there are still problems

  const cursorName = localStorage.getItem('cursor-name');
  const cursorColor = localStorage.getItem('cursor-color');

  const editor = useMemo(() => {
    const withReagentAugmentations =
      textType === 'chat' ? withChatElements : withPlainTextElements;

    let e = withCursors(
      withYjs(
        withReagentAugmentations(withReact(withHistory(createEditor()))),
        promptDocuments[documentKey]!,
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
  }, [promptDocuments, promptDocuments[documentKey], cursorName, cursorColor]);

  useEffect(() => {
    YjsEditor.connect(editor);
    return () => YjsEditor.disconnect(editor);
  }, [editor]);

  const renderElement = useCallback((props: any) => {
    switch (props.element.type) {
      case 'parameter':
        return <Parameter {...props} />;
      case 'chat-turn':
        return <ChatTurn {...props} />;
      default:
        return <TextFragment {...props} />;
    }
  }, []);

  // TODO: flow state dump 2023-12-08 17:12 -- need to keep a separate list of ids for each doc and merge for the control section. sync should be just for this doc.
  const syncParameters = useCallback(() => {
    const parameterOptionDict = store.documentParameters;

    const parameterElements = getParameterElements(editor);
    for (const element of parameterElements) {
      console.log('sync', element)
      if (!store.documentParameterIdsByDocument[documentKey]!.includes(element.parameterId)) {
        console.log('没有');
        store.documentParameterIdsByDocument[documentKey]!.push(element.parameterId);
      }
    }

    // now delete any that are no longer in the editor
    for (const id of store.documentParameterIdsByDocument[documentKey]!) {
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
    <div
      style={{
        width: 960,
        margin: 'auto',
        marginTop: 20,
      }}
      className="slate-wrapper"
    >
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
                addNewParameter(editor);
              }
            }}
          />
        </Cursors>
      </Slate>
      {/* Settings:
      <br />
      JSON output?{' '}
      <input
        type="checkbox"
        checked={options.jsonMode}
        onChange={(event) => {
          options.jsonMode = event.target.checked;
        }}
      /> */}

      <div>
        <h3>API URL</h3>
        http://localhost:2348/complete?apiKey=1234
        {/* todo fix this with the new parameter setup */}
        {/* {Object.keys(parameterOptions).map((parameterId) => {
          return `&${parameterOptions[parameterId].parameterName}=`;
        })} */}
      </div>
    </div>
  );
};

export default TextEditor;
