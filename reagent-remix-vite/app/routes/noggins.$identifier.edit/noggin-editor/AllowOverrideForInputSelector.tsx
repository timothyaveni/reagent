import { Skeleton } from '@mui/material';
import { overridableModelInputTypes } from 'reagent-noggin-shared/createDocumentVariableForOverride';
import { ModelInput } from 'reagent-noggin-shared/types/editorSchemaV1';
import { AllowOverrideForInputSelectorInner } from './AllowOverrideForInputSelectorInner';
import { useHasPopulatedStore } from './editor-utils';

export function AllowOverrideForInputSelector({
  inputKey,
  input,
}: {
  inputKey: string;
  input: ModelInput;
}) {
  if (!overridableModelInputTypes[input.type]) {
    return null;
  }

  const hasPopulatedStore = useHasPopulatedStore();

  if (!hasPopulatedStore) {
    return <Skeleton variant="rounded" height={20} width={60} />;
  }

  return (
    <AllowOverrideForInputSelectorInner inputKey={inputKey} input={input} />
  );
}
