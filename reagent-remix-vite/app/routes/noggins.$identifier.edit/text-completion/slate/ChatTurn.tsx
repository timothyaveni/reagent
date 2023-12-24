import { useCallback } from 'react';
import { Transforms } from 'slate';
import { ReactEditor, useSelected, useSlate } from 'slate-react';
import { ChatTurnNode } from '../editor-types';

export const ChatTurn = ({
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
