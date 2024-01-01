import { MenuItem, Select, Skeleton, Typography } from '@mui/material';
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
    // this is kinda doubled because the editor itself also does this -- but we need the store before that
    return <Skeleton variant="rectangular" height={200} />;
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
        <Typography variant="h2">{t(selectedOutputFormat.name)}</Typography>
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
          sx={{
            pr: 3,
            mb: 1,
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                '& .MuiTypography-root': {
                  fontSize: '1.2rem',
                  fontWeight: 400,
                },
              },
            },
          }}
        >
          {outputFormats.map((outputFormat) => (
            <MenuItem value={outputFormat.key} key={t(outputFormat.name)}>
              <Typography variant="h2">{t(outputFormat.name)}</Typography>
            </MenuItem>
          ))}
        </Select>
        {editor}
      </>
    );
  }
}
