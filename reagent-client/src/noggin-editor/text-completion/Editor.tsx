import { useCallback, useEffect, useMemo, useState } from 'react';
import { Editor as SlateEditor, Node, Transforms, createEditor } from 'slate';
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

import { withYjs, YjsEditor } from '@slate-yjs/core';

import * as Y from 'yjs';

import './Editor.css';

const store = syncedStore({
  // promptDocument: 'xml',
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
  // works similar to an @-mention but starting and ending with :

  return (
    <span {...attributes} className="parameter" contentEditable={false}>
      {element.parameterId}
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
      <div
        className={'chat-turn-inner' + (selected ? ' selected' : '')}
      >
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
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    // const { selection } = editor;

    // if (selection) {
    //   const [start] = Range.edges(selection);
    //   const parent = Node.parent(editor, start.path);

    //   if (editor.isInline(parent)) {
    return editor.insertText('\n');
    //   }
    // }

    // insertBreak();
  };

  editor.insertSoftBreak = () => {
    // todo: add a chat turn, different from the one we'e currently in (the last one before the selection)

    const { selection } = editor;

    Transforms.insertNodes(editor, {
      type: 'chat-turn',
      speaker: 'user',
      children: [{ text: '' }],
    } as unknown as Node); // todo hehe
    Transforms.move(editor);

    // return editor.insertText('\n');
  };

  return editor;
};

// todo: we will probably do this imperatively someday instead of on every update
const getAllParams = (editor: ReactEditor) => {
  // console.log(
  //   [...Node.nodes(editor)].filter(([node, path]: [any, number[]]) => {
  //     return node.type === 'parameter';
  //   }),
  // );
};

const Editor = () => {
  const options = useSyncedStore(store.options);
  const promptDocumentContainer = useSyncedStore(store.promptDocumentContainer);

  const editor = useMemo(() => {
    const e = withSoftBreak(
      withChatCompletionsElements(
        withReact(
          withHistory(withYjs(createEditor(), promptDocumentContainer.xml!)),
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
          // console.log(value);
          getAllParams(editor);
        }}
      >
        <Editable
          renderElement={renderElement}
          onKeyDown={(event) => {
            if (event.key === ':') {
              event.preventDefault();
              Transforms.insertNodes(editor, {
                type: 'parameter',
                parameterId: 'param1',
                children: [{ text: '' }],
              } as unknown as Node); // todo hehe
              Transforms.move(editor);
            } else if (event.key === '@') {
              // event.preventDefault();
            }
          }}
        />
      </Slate>
      Settings:
      <br />
      JSON output?{' '}
      <input
        type="checkbox"
        checked={options.jsonMode}
        onChange={(event) => {
          options.jsonMode = event.target.checked;
        }}
      />
    </div>
  );
};

export default Editor;
