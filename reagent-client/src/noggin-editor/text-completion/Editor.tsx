import { useCallback, useState } from 'react';
import { Node, Transforms, createEditor } from 'slate';
import { Editable, ReactEditor, Slate, withReact } from 'slate-react';
import { withHistory } from 'slate-history';

import './Editor.css';

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
  const { isInline, isVoid} = editor;

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
  console.log([...Node.nodes(editor)].filter(([node, path]: [any, number[]]
    ) => {
    return node.type === 'parameter';
  }));
};

const Editor = () => {
  const [editor] = useState(() => withSoftBreak(withParameters(withReact(withHistory(createEditor())))));

  const renderElement = useCallback((props: any) => {
    switch (props.element.type) {
      case 'parameter':
        return <Parameter {...props} />;
      default:
        return <p {...props.attributes}>{props.children}</p>;
    }
  }, []);

  const initialValue = [
    {
      type: 'paragraph',
      children: [{ text: 'A line of text in a paragraph.' }],
    },
  ];

  return (
    <div
      style={{
        width: 960,
        margin: 'auto',
        marginTop: 20,
      }}
      className="slate-wrapper"
    >
      <Slate editor={editor} initialValue={initialValue}
        onChange={(value) => {
          // console.log(value);
          getAllParams(editor);
        }}
      >
        <Editable renderElement={renderElement}
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
    </div>
  );
};

export default Editor;
