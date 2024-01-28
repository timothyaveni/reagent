import {
  AttachMoney as AttachMoneyIcon,
  Forum as ForumIcon,
} from '@mui/icons-material';
import { IconButton, Stack, Tooltip } from '@mui/material';
import { ReactEditor } from 'slate-react';
import T from '~/i18n/T';

export function EditorToolbar({
  editor,
  textType,
  openVariableEditor,
}: {
  editor: ReactEditor;
  textType: 'plain' | 'chat';
  openVariableEditor: () => any;
}) {
  return (
    <Stack
      className="slate-toolbar"
      py={1.5}
      px={2}
      spacing={0.5}
      direction="row"
    >
      <Tooltip title={<T>Add a new or existing variable</T>}>
        <IconButton
          onClick={() => {
            ReactEditor.focus(editor);
            editor.insertText('$');
            openVariableEditor();
          }}
        >
          <AttachMoneyIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>

      {textType === 'chat' && (
        <Tooltip title={<T>Switch the chat speaker</T>}>
          <IconButton
            onClick={() => {
              ReactEditor.focus(editor);
              // this is kinda awkward bc we have a plugin that overrides soft-breaks to add a chat turn --
              // it's mostly just a convenient way to capture shift+enter.
              // but so then we use it here, too. but we are of course not actually inserting a soft break.
              // normal insertBreak() just adds a newline (so is... a soft break, lol)
              editor.insertSoftBreak();
            }}
          >
            <ForumIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
}
