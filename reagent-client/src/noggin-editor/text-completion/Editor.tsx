import { useCallback, useEffect, useMemo, useState } from 'react';
import { Editor as SlateEditor, Node, Transforms, createEditor } from 'slate';
import { Editable, ReactEditor, Slate, withReact } from 'slate-react';
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

const initialValue = [{
  children: [{ text: '' }],
}];

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

const withParameters = (editor: any) => {
  const { isInline, isVoid } = editor;

  editor.isInline = (element: any) => {
    return element.type === 'parameter' ? true : isInline(element);
  };

  editor.isVoid = (element: any) => {
    return element.type === 'parameter' ? true : isVoid(element);
  };

  return editor;
};

const withSoftBreak = (editor: any) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    console.log('hey break');
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
    console.log('hey soft break');
    return editor.insertText('\n');
  };

  return editor;
};

// todo: we will probably do this imperatively someday instead of on every update
const getAllParams = (editor: ReactEditor) => {
  console.log(
    [...Node.nodes(editor)].filter(([node, path]: [any, number[]]) => {
      return node.type === 'parameter';
    }),
  );
};

const Editor = () => {
  const options = useSyncedStore(store.options);
  const promptDocumentContainer = useSyncedStore(store.promptDocumentContainer);

  const editor = useMemo(() => {
    const e = withSoftBreak(
      withParameters(
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
      default:
        return <p {...props.attributes}>{props.children}</p>;
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
