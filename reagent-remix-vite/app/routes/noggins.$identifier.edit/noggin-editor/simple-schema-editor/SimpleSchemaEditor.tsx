import { Skeleton } from '@mui/material';
import { ModelInput } from 'reagent-noggin-shared/types/editorSchema';
import { useHasPopulatedStore } from '../editor-utils';

import './SimpleSchemaEditor.css';
import { SimpleSchemaEditor } from './SimpleSchemaEditorInner.client';

export type SimpleSchemaEditorProps = {
  inputKey: string;
  input: ModelInput;
};

export default function SimpleSchemaEditorWrapper(
  props: SimpleSchemaEditorProps,
) {
  const hasPopulatedStore = useHasPopulatedStore();

  // oh whoops, this one can actually go in the same file.. bc we don't have bundler issues... but we still want this early return
  if (!hasPopulatedStore) {
    return <Skeleton variant="rectangular" height={400} />;
  }

  return <SimpleSchemaEditor {...props} />;
}
