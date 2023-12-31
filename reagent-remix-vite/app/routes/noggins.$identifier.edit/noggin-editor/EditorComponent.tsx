import { ModelInput } from 'reagent-noggin-shared/types/editorSchema';
import SimpleSchemaEditor from './simple-schema-editor/SimpleSchemaEditor';
import { TextEditorWrapper } from './slate/TextEditorWrapper';

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
        <TextEditorWrapper
          documentKey={inputKey}
          textType="chat"
          allowImages="user"
          editorHeight={input.editorHeight}
        />
      );
    case 'chat-text-with-parameters':
      return (
        <TextEditorWrapper
          documentKey={inputKey}
          textType="chat"
          editorHeight={input.editorHeight}
        />
      );
    case 'plain-text-with-parameters':
      return (
        <TextEditorWrapper
          documentKey={inputKey}
          textType="plain"
          editorHeight={input.editorHeight}
        />
      );
    case 'integer':
      return <>Not implemented</>;
    case 'number':
      return <>Not implemented</>;
    case 'boolean':
      return <>Not implemented</>;
    case 'select':
      return <>Not implemented</>;
    case 'simple-schema':
      return <SimpleSchemaEditor inputKey={inputKey} input={input} />;
  }
}
