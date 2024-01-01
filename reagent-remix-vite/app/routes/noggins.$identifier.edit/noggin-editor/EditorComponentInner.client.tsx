import { EditorComponentProps } from './EditorComponent';
import { IntegerEditor } from './primitive-editors/IntegerEditor';
import { NumberEditor } from './primitive-editors/NumberEditor';
import { SimpleSchemaEditor } from './simple-schema-editor/SimpleSchemaEditor.client';
import TextEditor from './slate/TextEditor.client';

export default function EditorComponentInner({
  inputKey,
  input,
}: EditorComponentProps) {
  switch (input.type) {
    case 'chat-text-user-images-with-parameters':
      return (
        <TextEditor
          documentKey={inputKey}
          textType="chat"
          allowImages="user"
          editorHeight={input.editorHeight}
        />
      );
    case 'chat-text-with-parameters':
      return (
        <TextEditor
          documentKey={inputKey}
          textType="chat"
          editorHeight={input.editorHeight}
        />
      );
    case 'plain-text-with-parameters':
      return (
        <TextEditor
          documentKey={inputKey}
          textType="plain"
          editorHeight={input.editorHeight}
        />
      );
    case 'integer':
      return <IntegerEditor inputKey={inputKey} input={input} />;
    case 'number':
      return <NumberEditor inputKey={inputKey} input={input} />;
    case 'boolean':
      return <>Not implemented</>;
    case 'select':
      return <>Not implemented</>;
    case 'simple-schema':
      return <SimpleSchemaEditor inputKey={inputKey} input={input} />;
    default:
      const _exhaustiveCheck: never = input;
  }
}
