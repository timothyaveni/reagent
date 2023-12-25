import { Skeleton } from '@mui/material';
import { useHasPopulatedStore } from '../editor-utils';
import TextEditor, { TextEditorProps } from './TextEditor.client';

export function TextEditorWrapper(props: TextEditorProps) {
  const hasPopulatedStore = useHasPopulatedStore();

  if (!hasPopulatedStore) {
    return (
      <div
        className={
          'slate-skeleton' + (props.editorHeight === 'primary' ? 'primary' : '')
        }
      >
        <Skeleton
          variant="rounded"
          height={props.editorHeight === 'primary' ? 400 : 75}
        />
      </div>
    );
  }

  return <TextEditor {...props} />;
}
