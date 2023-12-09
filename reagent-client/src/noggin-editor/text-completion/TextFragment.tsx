import { Node } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { ChatTurnNode } from './editor-types';

import './TextFragment.css';

export const TextFragment = ({
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

  let className = 'text-paragraph';

  // in chat completion, the previous node is the chat turn
  const previousTopLevelElementPath = [path[0] - 1];

  if (previousTopLevelElementPath[0] >= 0) {
    const previousTopLevelElement = Node.get(
      editor,
      previousTopLevelElementPath,
    );

    // @ts-ignore
    if (previousTopLevelElement.type === 'chat-turn') {
      className += ' text-paragraph-chat-turn';

      const previousTopLevelElementNode =
        previousTopLevelElement as ChatTurnNode;

      if (previousTopLevelElementNode.speaker === 'user') {
        className += ' text-paragraph-user';
      } else if (previousTopLevelElementNode.speaker === 'assistant') {
        className += ' text-paragraph-assistant';
      }
    }
  }

  return (
    <p className={className} {...attributes}>
      {children}
    </p>
  );
};
