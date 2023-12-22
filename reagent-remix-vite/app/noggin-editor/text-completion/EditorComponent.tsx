import { ModelInput } from '~/shared/editorSchema';
import TextEditor from './TextEditor';

export default function EditorComponent({
  inputKey,
  input,
}: {
  inputKey: string;
  input: ModelInput;
}) {
  switch (input.type) {
    case 'chat-text-user-images-with-parameters':
      return <>Not implemented</>;

    // TODO: min-height settings in the editor schema -- like we had in className="slate-wrapper-main"
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
