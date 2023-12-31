import { MenuItem, Select, Skeleton } from '@mui/material';
import { useSyncedStore } from '@syncedstore/react';
import {
  ModelInput,
  OutputFormat,
} from 'reagent-noggin-shared/types/editorSchema';
import { t } from '~/i18n/T';
import { useEditorStore, useHasPopulatedStore } from '../editor-utils';
import SingleFormatEditor from './SingleFormatEditor';

type ModelOutputEditorProps = {
  outputFormats: OutputFormat[];
  editorComponents: Record<string, ModelInput>;
};

export function ModelOutputEditor(
  props: ModelOutputEditorProps,
): JSX.Element | null {
  const hasPopulatedStore = useHasPopulatedStore();

  if (!hasPopulatedStore) {
    // TODO: we can show the header, at least, if there's only one output format
    return <Skeleton variant="rectangular" height={400} />;
  }

  return <ModelOutputEditorInner {...props} />;
}

function ModelOutputEditorInner({
  outputFormats,
  editorComponents,
}: ModelOutputEditorProps) {
  const store = useEditorStore();
  const nogginOptions = useSyncedStore(store.nogginOptions);

  if (outputFormats.length === 0) {
    throw new Error('outputFormats must not be empty');
  }

  const chosenOutputFormatKey = nogginOptions.chosenOutputFormatKey!;
  const selectedOutputFormat = outputFormats.find(
    (outputFormat) => outputFormat.key === chosenOutputFormatKey,
  )!;

  const editor = (
    <SingleFormatEditor
      outputFormat={selectedOutputFormat}
      editorComponents={selectedOutputFormat.editorComponents.map(
        (inputKey) => ({
          inputKey,
          input: editorComponents[inputKey],
        }),
      )}
    />
  );

  if (outputFormats.length === 1) {
    return (
      <>
        <h3>{t(selectedOutputFormat.name)}</h3>
        {editor}
      </>
    );
  } else {
    return (
      <>
        <Select
          variant="standard"
          value={chosenOutputFormatKey}
          onChange={(e) => {
            nogginOptions.chosenOutputFormatKey = e.target.value;
          }}
        >
          {outputFormats.map((outputFormat) => (
            <MenuItem value={outputFormat.key} key={t(outputFormat.name)}>
              {t(outputFormat.name)}
            </MenuItem>
          ))}
        </Select>
        {editor}
      </>
    );
  }
}
