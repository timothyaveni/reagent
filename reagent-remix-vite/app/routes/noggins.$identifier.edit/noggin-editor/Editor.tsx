import React, { useContext } from 'react';

import { Paper, Stack, Typography } from '@mui/material';
import { EditorSchema } from 'reagent-noggin-shared/types/editorSchema';
import { StoreContext } from '~/routes/noggins.$identifier/StoreContext';
import './Editor.css';
import EditorColumn from './EditorColumn';
import { AllParameterOptionControls } from './ParameterOptionControls';
import { ModelOutputEditor } from './output-editor/ModelOutputEditor';

export interface EditorProps {
  noggin: {
    id: number;
  };
  editorSchema: EditorSchema;
}

const Editor: React.FC<EditorProps> = (props) => {
  const { store } = useContext(StoreContext);

  const { editorSchema } = props;
  console.log({ editorSchema });

  return (
    <Stack direction={'row'} spacing={2} alignItems={'top'}>
      <Stack spacing={2} sx={{ flex: 2 }}>
        <Paper elevation={2} sx={{ padding: 2 }}>
          <Typography variant="h5" component="h2">
            Model inputs
          </Typography>
          <EditorColumn
            inputs={editorSchema.modelInputComponents.map((inputKey) => ({
              inputKey,
              input: editorSchema.allEditorComponents[inputKey],
            }))}
          />
        </Paper>

        <Paper elevation={2} sx={{ padding: 3 }}>
          <Typography variant="h5" component="h2">
            Model output
          </Typography>
          <ModelOutputEditor
            outputFormats={editorSchema.outputFormats}
            editorComponents={editorSchema.allEditorComponents} // TODO this maybe goes in context or we filter it in the prop-drill
          />
        </Paper>
      </Stack>

      <Stack spacing={2} sx={{ flex: 1 }}>
        <Paper elevation={0} sx={{ padding: 2 }}>
          <AllParameterOptionControls
            documents={editorSchema.modelInputComponents}
          />
        </Paper>
      </Stack>
    </Stack>
  );
};

export default Editor;
