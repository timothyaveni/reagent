import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Editor as SlateEditor,
  Node,
  Transforms,
  createEditor,
  Range,
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

import { v4 as uuid } from 'uuid';
import { debounce } from 'underscore';

import './Editor.css';
import { Cursors } from './Cursors';

const store = syncedStore({
  // promptDocument: 'xml',
  promptDocumentContainer: {} as {
    xml: Y.XmlText;
  },
  options: {} as {
    jsonMode: boolean;
  },
  parameterOptions: {} as {
    // todo: actually, we really should just make this part of the slate state so it's cut-and-pastable
    [parameterId: string]: Y.Map<{
      parameterName: string;
      maxLength: number;
    }>;
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
  const parameterOptions = useSyncedStore(store.parameterOptions);
  const parameter = parameterOptions[element.parameterId];

  if (!parameter) {
    return <span {...attributes}>{children}</span>;
  }

  return (
    <span
      {...attributes}
      className={'parameter' + (selected ? ' selected' : '')}
      contentEditable={false}
    >
      {/* @ts-ignore */}
      {parameter.parameterName}
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

  const editor = useSlate() as unknown as ReactEditor; // i really think this will work...

  const setSpeaker = (speaker: 'user' | 'assistant') => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.setNodes(editor, { speaker } as unknown as any, { at: path }); // yikers
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
            {/* « User */}
            User
          </div>
        ) : (
          <div
            className="chat-turn-button chat-turn-button-assistant"
            role="button"
            onClick={setUser}
          >
            {/* Assistant » */}
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
  const editor = useSlate() as unknown as ReactEditor; // todo
  const path = ReactEditor.findPath(editor, element);

  const previousTopLevelElement = [path[0] - 1];

  const previousTopLevelElementNode = Node.get(editor, previousTopLevelElement);

  let className;

  // @ts-ignore
  if (previousTopLevelElementNode?.speaker === 'user') {
    className = 'text-paragraph-user';
    // @ts-ignore
  } else if (previousTopLevelElementNode?.speaker === 'assistant') {
    className = 'text-paragraph-assistant';
  }

  return (
    <p className={'text-paragraph ' + className} {...attributes}>
      {children}
    </p>
  );
};

const withParameterSyncing = (editor: any) => {
  const {
    insertFragment,
    insertBreak,
    insertSoftBreak,
    insertNode,
    insertText,

    deleteForward,
    deleteBackward,
    deleteFragment,
  } = editor;

  // if there's a selection, inserts can delete text
  // let's only do this for insertText for now -- this is where we need the optimization, and others get called e.g. on ctrl+z or ctrl+v where we might get new params
  // ugh, that didn't fix it... screw it, we'll do it in onChange for now but def an optimization issue
  const hasSelection = () => {
    console.log('hasSelection', editor.selection);
    if (editor.selection) {
      // if range is empty
      if (!Range.isCollapsed(editor.selection)) {
        console.log('hasSelection true');
        return true;
      }
    }

    console.log('hasSelection false');
    return false;
  };

  editor.deleteForward = (...args: any) => {
    deleteForward(...args);
    syncAllParams(editor);
  };

  editor.deleteBackward = (...args: any) => {
    deleteBackward(...args);
    syncAllParams(editor);
  };

  editor.deleteFragment = (...args: any) => {
    deleteFragment(...args);
    syncAllParams(editor);
  };

  editor.insertFragment = (...args: any) => {
    // const nowHasSelection = hasSelection();
    insertFragment(...args);
    // if (nowHasSelection) {
    syncAllParams(editor);
    // }
  };

  editor.insertBreak = (...args: any) => {
    // const nowHasSelection = hasSelection();
    insertBreak(...args);
    // if (nowHasSelection) {
    syncAllParams(editor);
    // }
  };

  editor.insertSoftBreak = (...args: any) => {
    // const nowHasSelection = hasSelection();
    insertSoftBreak(...args);
    // if (nowHasSelection) {
    syncAllParams(editor);
    // }
  };

  editor.insertNode = (...args: any) => {
    // const nowHasSelection = hasSelection();
    insertNode(...args);
    // if (nowHasSelection) {
    syncAllParams(editor);
    // }
  };

  editor.insertText = (...args: any) => {
    const nowHasSelection = hasSelection();
    insertText(...args);
    if (nowHasSelection) {
      syncAllParams(editor);
    }
  };

  return editor;
};

const withChatCompletionsElements = (editor: any) => {
  const {
    isInline,
    isVoid,
    normalizeNode,
    deleteForward,
    deleteBackward,
    deleteFragment,
  } = editor;

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
          } as unknown as Node,
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
    } as unknown as Node); // todo hehe
    Transforms.move(editor);
  };

  return editor;
};

const syncAllParams = (editor: ReactEditor) => {
  const parameterIds = [...Node.nodes(editor)]
    .filter(([node, path]: [any, number[]]) => {
      return node.type === 'parameter';
    })
    .map(([node]: [any, any]) => node.parameterId);

  const storeParameterIds = Object.keys(store.parameterOptions);
  console.log({ storeParameterIds, parameterIds });

  for (const parameterId of storeParameterIds) {
    if (!parameterIds.includes(parameterId)) {
      delete store.parameterOptions[parameterId];
    }
  }

  let nextParamNumber = storeParameterIds.length + 1;

  for (const parameterId of parameterIds) {
    console.log(store.parameterOptions, Object.values(store.parameterOptions));
    while (
      Object.values(store.parameterOptions).some(
        // @ts-ignore you are KILLING me here typescript
        (p) => p.parameterName === `param${nextParamNumber}`,
      )
    ) {
      nextParamNumber++;
    }

    if (!storeParameterIds.includes(parameterId)) {
      store.parameterOptions[parameterId] = new Y.Map([
        ['parameterName', `param${nextParamNumber}`],
        ['maxLength', 500],
      ]);
    }
  }
};

const addNewParameter = (editor: ReactEditor) => {
  console.log('pre', [...Node.nodes(editor)]);
  Transforms.insertNodes(editor, {
    type: 'parameter',
    parameterId: uuid(),
    children: [{ text: '' }],
  } as unknown as Node); // todo hehe
  console.log('post', [...Node.nodes(editor)]);
  Transforms.move(editor);
  // syncAllParams(editor);
};

const ParameterOptionControls = ({
  parameterOptions,
  onChange,
}: {
  parameterOptions: any;
  onChange?: any;
}) => {
  console.log('damn', parameterOptions);

  return (
    <div>
      <h3>Parameter Options</h3>
      {Object.keys(parameterOptions).map((parameterId) => {
        return (
          <div
            key={parameterId}
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
              // @ts-ignore
              value={parameterOptions[parameterId].parameterName}
              onChange={(event) => {
                // @ts-ignore
                parameterOptions[parameterId].parameterName =
                  event.target.value;
                onChange();
              }}
            />
            <br />
            Max length:{' '}
            <input
              type="number"
              className="parameter-max-length-input"
              // @ts-ignore
              value={parameterOptions[parameterId].maxLength}
              onChange={(event) => {
                // @ts-ignore
                parameterOptions[parameterId].maxLength = parseInt(
                  event.target.value,
                );
                onChange();
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
    parameterOptions: store.parameterOptions,
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
  const parameterOptions = useSyncedStore(store.parameterOptions); // I thiiink this is a quirk of the library, that we have to do this here instead of in ParameterControls so it will rerender
  // hm, it looks like it might still not be rerendering, especially when there are other (cross-tab comms?) users. it's okay, we're planning to put all this in slate soon. we'll revisit if there are still problems

  const cursorName = localStorage.getItem('cursor-name');
  const cursorColor = localStorage.getItem('cursor-color');

  const editor = useMemo(() => {
    const e = withSoftBreak(
      withChatCompletionsElements(
        withReact(
          withCursors(
            withParameterSyncing(
              withHistory(
                withYjs(createEditor(), promptDocumentContainer.xml!),
              ),
            ),
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
          syncAllParams(editor);
          debouncedSave(value);
        }}
      >
        <Cursors>
          <Editable
            renderElement={renderElement}
            onKeyDown={(event) => {
              if (event.key === '@') {
                event.preventDefault();
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
      <ParameterOptionControls
        parameterOptions={parameterOptions}
        onChange={() => debouncedSave(editor.children)}
      />
      <div>
        <h3>API URL</h3>
        http://localhost:2348/complete?apiKey=1234
        {Object.keys(parameterOptions).map((parameterId) => {
          // @ts-ignore
          return `&${parameterOptions[parameterId].parameterName}=`;
        })}
      </div>
    </div>
  );
};

export default Editor;
