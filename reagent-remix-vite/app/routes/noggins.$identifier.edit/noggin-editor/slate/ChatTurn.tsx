import { useCallback, useContext } from 'react';
import { Transforms } from 'slate';
import { ReactEditor, useSelected, useSlate } from 'slate-react';
import { ChatTurnNode } from '../editor-types';
import T from '~/i18n/T.js';
import { Box } from '@mui/material';
import { ModelInputContext } from '../InputsColumn.js';

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

  const modelInput = useContext(ModelInputContext);
  const cycle =
    modelInput.type === 'chat-text'
      ? modelInput.chatTextCapabilities.messageTypes
      : // legacy chat-text types
        ['user', 'assistant'];

  const setSpeaker = (speaker: ChatTurnNode['speaker']) => {
    const path = ReactEditor.findPath(editor, element);
    const update: Partial<ChatTurnNode> = {
      speaker,
    };
    Transforms.setNodes(editor, update, { at: path });
    // force slate rerender on paragraphs
  };

  const cycleSpeaker = useCallback(() => {
    const currentSpeaker = element.speaker;
    const currentIndex = cycle.indexOf(currentSpeaker);
    const nextIndex = (currentIndex + 1) % cycle.length;
    const nextSpeaker = cycle[nextIndex] as ChatTurnNode['speaker'];
    setSpeaker(nextSpeaker);
  }, [element.speaker]);

  return (
    <div {...attributes} className="chat-turn" contentEditable={false}>
      <div className={'chat-turn-inner' + (selected ? ' selected' : '')}>
        {element.speaker === 'user' ? (
          <Box
            className="chat-turn-button chat-turn-button-user"
            role="button"
            onClick={cycleSpeaker}
          >
            <T>User</T>
          </Box>
        ) : element.speaker === 'assistant' ? (
          <Box
            className="chat-turn-button chat-turn-button-assistant"
            role="button"
            onClick={cycleSpeaker}
          >
            <T>Assistant</T>
          </Box>
        ) : element.speaker === 'developer' ? (
          <Box
            className="chat-turn-button chat-turn-button-developer"
            role="button"
            onClick={cycleSpeaker}
          >
            <T>Developer</T>
          </Box>
        ) : null}
      </div>
      {children}
    </div>
  );
};
