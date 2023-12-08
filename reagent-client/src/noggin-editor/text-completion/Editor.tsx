import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Editor as SlateEditor,
  Node,
  Transforms,
  createEditor,
  Range,
  BaseElement,
} from 'slate';
import {
  Editable,
  ReactEditor,
  Slate,
  useSelected,
  withReact,
  useSlate,
} from 'slate-react';
import { withHistory } from 'slate-history';

import { getYjsDoc, syncedStore } from '@syncedstore/core';
import { useSyncedStore } from '@syncedstore/react';
import { WebsocketProvider } from 'y-websocket';

import { withCursors, withYjs, YjsEditor } from '@slate-yjs/core';

import * as Y from 'yjs';

import { debounce } from 'underscore';

import './Editor.css';
import { Cursors } from './Cursors';

type ParameterOptions = {
  maxLength: number;
};

interface ParameterNode extends BaseElement {
  type: 'parameter';
  parameterName: string;
  parameterOptions: ParameterOptions;
}

interface ChatTurnNode extends BaseElement {
  type: 'chat-turn';
  speaker: 'user' | 'assistant';
}

const store = syncedStore({
  promptDocumentContainer: {} as {
    xml: Y.XmlText;
  },
  options: {} as {
    jsonMode: boolean;
  },
});

store.promptDocumentContainer.xml = new Y.XmlText();
// so, we need to set a default jsonMode if it's not already set after yjs syncs, but we don't want to do it prematurely in case there *is* something to sync
// (in the real world, the race condition doesn't matter bc the default is just coming from the same place in the backend db)
// if we don't set a default then we get in trouble trying to render the component

const doc = getYjsDoc(store);
const websocketProvider = new WebsocketProvider(
  'ws://localhost:2347',
  'reagent-noggin',
  doc,
);

const initialValue: any[] = [
  // {
  //   children: [{ text: '' }],
  // },
];

const Parameter = ({
  attributes,
  children,
  element,
}: {
  attributes: any;
  children: any;
  element: any;
}) => {
  const selected = useSelected();

  return (
    <span
      {...attributes}
      className={'parameter' + (selected ? ' selected' : '')}
      contentEditable={false}
    >
      {element.parameterName}
      {children}
    </span>
  );
};

const ChatTurn = ({
  attributes,
  children,
  element,
}: {
  attributes: any;
  children: any;
  element: any;
}) => {
  const selected = useSelected();

  const editor = useSlate() as ReactEditor; // i really think this will work...

  const setSpeaker = (speaker: 'user' | 'assistant') => {
    const path = ReactEditor.findPath(editor, element);
    const update: Partial<ChatTurnNode> = {
      speaker,
    };
    Transforms.setNodes(editor, update, { at: path });
    // force slate rerender on paragraphs
  };

  const setUser = useCallback(() => {
    setSpeaker('user');
  }, []);

  const setAssistant = useCallback(() => {
    setSpeaker('assistant');
  }, []);

  return (
    <div {...attributes} className="chat-turn" contentEditable={false}>
      <div className={'chat-turn-inner' + (selected ? ' selected' : '')}>
        {element.speaker === 'user' ? (
          <div
            className="chat-turn-button chat-turn-button-user"
            role="button"
            onClick={setAssistant}
          >
            User
          </div>
        ) : (
          <div
            className="chat-turn-button chat-turn-button-assistant"
            role="button"
            onClick={setUser}
          >
            Assistant
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

const TextFragment = ({
  attributes,
  children,
  element,
}: {
  attributes: any;
  children: any;
  element: any;
}) => {
  const editor = useSlate() as ReactEditor;
  const path = ReactEditor.findPath(editor, element);

  const previousTopLevelElement = [path[0] - 1];

  // todo: i thiink the normalization means this is never undefined but it's a risky typecast
  const previousTopLevelElementNode = Node.get(editor, previousTopLevelElement) as ChatTurnNode;

  let className;

  if (previousTopLevelElementNode.speaker === 'user') {
    className = 'text-paragraph-user';
  } else if (previousTopLevelElementNode.speaker === 'assistant') {
    className = 'text-paragraph-assistant';
  }

  return (
    <p className={'text-paragraph ' + className} {...attributes}>
      {children}
    </p>
  );
};

const withChatCompletionsElements = (editor: any) => {
  const { isInline, isVoid, normalizeNode } = editor;

  editor.isInline = (element: any) => {
    if (element.type === 'parameter') {
      return true;
    }

    if (element.type === 'chat-turn') {
      return false;
    }

    return isInline(element);
  };

  editor.isVoid = (element: any) => {
    if (element.type === 'parameter') {
      return true;
    }

    if (element.type === 'chat-turn') {
      return true;
    }

    return isVoid(element);
  };

  editor.normalizeNode = ([node, path]: [any, any]) => {
    // we're normalizing the root node
    if (path.length === 0) {
      const insertTopChatTurn = () => {
        // this is a little weird as a thing to do if they backspace the top chat turn and it was an 'assistant' turn and it converts to a user one -- really what we want to do is forbid the backspace, but this will do
        Transforms.insertNodes(
          editor,
          {
            type: 'chat-turn',
            speaker: 'user',
            children: [{ text: '' }],
          } as ChatTurnNode,
          { at: [0] },
        );
      };

      // if no children or we aren't starting with a chat turn, add one.
      // UNLESS the top paragraph is empty and the next thing is a chat turn -- then we should just delete the paragraph. this is the common mode if you delete the top chat turn but still want the other stuff in there
      if (editor.children.length === 0) {
        insertTopChatTurn();
      } else {
        const topChild = editor.children[0];
        if (
          topChild.type === 'paragraph' &&
          topChild.children[0].text === '' &&
          editor.children[1]?.type === 'chat-turn'
        ) {
          Transforms.removeNodes(editor, { at: [0] });
        } else if (topChild.type !== 'chat-turn') {
          insertTopChatTurn();
        }
      }

      // go through the top-level elements. if any chat turn isn't followed by a paragraph, add one
      for (let i = 0; i < editor.children.length; i++) {
        const child = editor.children[i];
        // console.log(1, child, i, editor.children.length);

        if (
          child.type === 'chat-turn' &&
          ((i < editor.children.length - 1 &&
            editor.children[i + 1].type !== 'paragraph') ||
            i === editor.children.length - 1)
        ) {
          Transforms.insertNodes(
            editor,
            {
              type: 'paragraph',
              children: [{ text: '' }],
            } as unknown as Node,
            { at: [i + 1] },
          );
        }
      }

      // merge paragraphs that are next to each other
      for (let i = 0; i < editor.children.length; i++) {
        const child = editor.children[i];
        // console.log(2, child);

        if (
          child.type === 'paragraph' &&
          i < editor.children.length - 1 &&
          editor.children[i + 1].type === 'paragraph'
        ) {
          const text =
            child.children[0].text +
            '\n' +
            editor.children[i + 1].children[0].text;
          Transforms.mergeNodes(editor, { at: [i + 1] });
          i--; // hmm feels like i need this
        }
      }
    }

    return normalizeNode([node, path]);
  };

  return editor;
};

const withSoftBreak = (editor: any) => {
  editor.insertBreak = () => {
    return editor.insertText('\n');
  };

  editor.insertSoftBreak = () => {
    // todo: add a chat turn, different from the one we'e currently in (the last one before the selection)

    let speaker = 'user';
    const { selection } = editor;

    if (selection) {
      // todo
    }

    Transforms.insertNodes(editor, {
      type: 'chat-turn',
      speaker,
      children: [{ text: '' }],
    } as ChatTurnNode);
    Transforms.move(editor);
  };

  return editor;
};

const getParameterElements = (editor: ReactEditor) => {
  return [...Node.nodes(editor)]
    .filter(([node, path]: [any, number[]]) => {
      return node.type === 'parameter';
    })
    .map(([node, path]: [any, number[]]) => {
      return node as ParameterNode;
    });
};

const addNewParameter = (editor: ReactEditor) => {
  const existingParameters = getParameterElements(editor);
  let newIndex = existingParameters.length + 1;
  while (existingParameters.some((p) => p.parameterName === `param${newIndex}`)) {
    newIndex++;
  }

  Transforms.insertNodes(editor, {
    type: 'parameter',
    parameterName: `param${newIndex}`,
    children: [{ text: '' }],
    parameterOptions: {
      maxLength: 500,
    },
  } as ParameterNode);

  Transforms.move(editor);
};

const ParameterOptionControls = () => {
  const editor = useSlate() as ReactEditor;
  // todo we can bring this into a hook to make it more efficient, probably... and debounce it
  const parameterElements = getParameterElements(editor);

  return (
    <div>
      <h3>Parameter Options</h3>
      {parameterElements.map((element, i) => {
        return (
          <div
            key={i} // always a little rough to use the index but there's no id, and using the name means the text field unfocuses when you change it
            className="parameter-control"
            style={{
              border: '1px solid #ccc',
              padding: 10,
              marginBottom: 10,
            }}
          >
            <input
              type="text"
              className="parameter-name-input"
              value={element.parameterName}
              onChange={(event) => {
                const path = ReactEditor.findPath(editor, element);
                const update: Partial<ParameterNode> = {
                  parameterName: event.target.value,
                };
                Transforms.setNodes(editor, update, { at: path });
              }}
            />
            <br />
            Max length:{' '}
            <input
              type="number"
              className="parameter-max-length-input"
              value={element.parameterOptions.maxLength}
              onChange={(event) => {
                const path = ReactEditor.findPath(editor, element);
                const update: Partial<ParameterNode> = {
                  parameterOptions: {
                    maxLength: parseInt(event.target.value),
                  },
                };
                Transforms.setNodes(editor, update, { at: path });
              }}
            />
          </div>
        );
      })}
    </div>
  );
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

const debouncedSave = debounce(save, 1000);

const Editor = () => {
  const options = useSyncedStore(store.options);
  const promptDocumentContainer = useSyncedStore(store.promptDocumentContainer);
  // const parameterOptions = useSyncedStore(store.parameterOptions); // I thiiink this is a quirk of the library, that we have to do this here instead of in ParameterControls so it will rerender
  // hm, it looks like it might still not be rerendering, especially when there are other (cross-tab comms?) users. it's okay, we're planning to put all this in slate soon. we'll revisit if there are still problems

  const cursorName = localStorage.getItem('cursor-name');
  const cursorColor = localStorage.getItem('cursor-color');

  const editor = useMemo(() => {
    const e = withSoftBreak(
      withChatCompletionsElements(
        withReact(
          withCursors(
            withHistory(withYjs(createEditor(), promptDocumentContainer.xml!)),
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

    // from the slate docs. i think more realistically in such cases we will wait for info from the server and construct the doc then.
    // Ensure editor always has at least 1 valid child
    const { normalizeNode } = e;
    e.normalizeNode = (entry: any) => {
      const [node] = entry;

      if (!SlateEditor.isEditor(node) || node.children.length > 0) {
        return normalizeNode(entry);
      }

      Transforms.insertNodes(editor, initialValue, { at: [0] });
    };

    return e;
  }, [promptDocumentContainer, promptDocumentContainer.xml]);

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

export default Editor;
