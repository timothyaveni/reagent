import { ModelInput } from 'reagent-noggin-shared/types/editorSchema';

export type EditorComponentProps = {
  inputKey: string;
  input: ModelInput;
};

import { Skeleton } from '@mui/material';
import EditorComponentInner from './EditorComponentInner.client';
import { useHasPopulatedStore } from './editor-utils';

export default function EditorComponentWrapper({
  inputKey,
  input,
}: {
  inputKey: string;
  input: ModelInput;
}) {
  const hasPopulatedStore = useHasPopulatedStore();

  if (!hasPopulatedStore) {
    switch (input.type) {
      case 'chat-text':
      case 'chat-text-user-images-with-parameters':
      case 'chat-text-with-parameters':
      case 'plain-text-with-parameters':
        return (
          <Skeleton
            variant="rounded"
            height={input.editorHeight === 'primary' ? 400 : 75}
          />
        );
      case 'image':
        return <Skeleton variant="rounded" height={100} />;
      case 'integer':
      case 'number':
      case 'boolean':
      case 'select':
        return <Skeleton variant="rounded" height={50} />;
      case 'simple-schema':
        return <Skeleton variant="rounded" height={200} />;
      default:
        const _exhaustiveCheck: never = input;
    }
  }

  return <EditorComponentInner inputKey={inputKey} input={input} />;
}
