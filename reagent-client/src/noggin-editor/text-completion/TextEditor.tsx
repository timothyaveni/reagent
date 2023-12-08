import { useCallback, useEffect, useMemo } from 'react';
import {
  createEditor
} from 'slate';
import {
  Editable,
  Slate,
  withReact,
} from 'slate-react';
import { withHistory } from 'slate-history';

import { useSyncedStore } from '@syncedstore/react';

import { withCursors, withYjs, YjsEditor } from '@slate-yjs/core';

import './TextEditor.css';
import { Cursors } from './Cursors';
import { ParameterOptionControls } from './ParameterOptionControls';
import { withChatCompletionsElements, withSoftBreak } from './editorPlugins';
import { TextFragment } from './TextFragment';
import { ChatTurn } from './ChatTurn';
import { Parameter } from './Parameter';
import { addNewParameter } from './editor-utils';
import { debouncedSave } from './editor-utils';
import { store, websocketProvider } from './store';

const initialValue: any[] = [
  // {
  //   children: [{ text: '' }],
  // },
];

type Props = {
  documentKey: string;
};

const TextEditor = ({
  documentKey,
}: Props) => {
  const promptDocuments = useSyncedStore(store.promptDocuments);
  // const parameterOptions = useSyncedStore(store.parameterOptions); // I thiiink this is a quirk of the library, that we have to do this here instead of in ParameterControls so it will rerender
  // hm, it looks like it might still not be rerendering, especially when there are other (cross-tab comms?) users. it's okay, we're planning to put all this in slate soon. we'll revisit if there are still problems

  const cursorName = localStorage.getItem('cursor-name');
  const cursorColor = localStorage.getItem('cursor-color');

  const editor = useMemo(() => {
    const e = withSoftBreak(
      withChatCompletionsElements(
        withReact(
          withCursors(
            withHistory(withYjs(createEditor(), promptDocuments[documentKey]!)),
            websocketProvider.awareness,
            {
              data: {
                name: cursorName || 'Anonymous',
                color: cursorColor || '#000000',
              },
            },
          ),
        ),
      ),
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
        <ParameterOptionControls />
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
