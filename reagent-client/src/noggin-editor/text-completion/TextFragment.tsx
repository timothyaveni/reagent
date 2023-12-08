import { Node } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { ChatTurnNode } from './editor-types';

export const TextFragment = ({
  attributes, children, element,
}: {
  attributes: any;
  children: any;
  element: any;
}) => {
  const editor = useSlate() as ReactEditor;
  const path = ReactEditor.findPath(editor, element);

  const previousTopLevelElement = [path[0] - 1];

  // todo: i thiink the normalization means this is never undefined but it's a risky typecast
  const previousTopLevelElementNode = Node.get(
    editor,
    previousTopLevelElement
  ) as ChatTurnNode;

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
