import { ModelInput } from '~/shared/editorSchema';
import TextEditor from './slate/TextEditor';

export default function EditorComponent({
  inputKey,
  input,
}: {
  inputKey: string;
  input: ModelInput;
}) {
  switch (input.type) {
    case 'chat-text-user-images-with-parameters':
      return (
        <TextEditor
          documentKey={inputKey}
          textType="chat"
          allowImages="user"
          className={
            input.editorHeight === 'primary' ? 'slate-wrapper-main' : ''
          }
        />
      );
    case 'chat-text-with-parameters':
      return (
        <TextEditor
          documentKey={inputKey}
          textType="chat"
          className={
            input.editorHeight === 'primary' ? 'slate-wrapper-main' : ''
          }
        />
      );
    case 'plain-text-with-parameters':
      return (
        <TextEditor
          documentKey={inputKey}
          textType="plain"
          className={
            input.editorHeight === 'primary' ? 'slate-wrapper-main' : ''
          }
        />
      );
    case 'integer':
      return <>Not implemented</>;
    case 'number':
      return <>Not implemented</>;
  }
}
