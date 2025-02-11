import { Alert, Box } from '@mui/material';
import { ErrorBoundary } from 'react-error-boundary';
import T from '~/i18n/T';
import { EditorComponentProps } from './EditorComponent';
import { ImageEditor } from './image-editor/ImageEditor';
import { BooleanEditor } from './primitive-editors/BooleanEditor.js';
import { IntegerEditor } from './primitive-editors/IntegerEditor';
import { NumberEditor } from './primitive-editors/NumberEditor';
import { SelectEditor } from './primitive-editors/SelectEditor.js';
import { SimpleSchemaEditor } from './simple-schema-editor/SimpleSchemaEditor.client';
import TextEditor from './slate/TextEditor.client';

// lol
function EditorComponentInnerInner({ inputKey, input }: EditorComponentProps) {
  switch (input.type) {
    case 'chat-text':
      // todo we should use context for capabilities
      return (
        <TextEditor
          documentKey={inputKey}
          textType="chat"
          // obviously not quite right
          allowImages={
            input.chatTextCapabilities.images !== false ? 'user' : undefined
          }
          editorHeight={input.editorHeight}
        />
      );
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
    case 'image':
      return <ImageEditor inputKey={inputKey} input={input} />;
    case 'integer':
      return <IntegerEditor inputKey={inputKey} input={input} />;
    case 'number':
      return <NumberEditor inputKey={inputKey} input={input} />;
    case 'boolean':
      return <BooleanEditor inputKey={inputKey} input={input} />;
    case 'select':
      return <SelectEditor inputKey={inputKey} input={input} />;
    case 'simple-schema':
      return <SimpleSchemaEditor inputKey={inputKey} input={input} />;
    default:
      const _exhaustiveCheck: never = input;
  }
}

export default function EditorComponentInner(props: EditorComponentProps) {
  return (
    <ErrorBoundary
      fallback={
        <Box>
          <Alert severity="error">
            <T>This editor could not load.</T>
          </Alert>
        </Box>
      }
    >
      <EditorComponentInnerInner {...props} />
    </ErrorBoundary>
  );
}
