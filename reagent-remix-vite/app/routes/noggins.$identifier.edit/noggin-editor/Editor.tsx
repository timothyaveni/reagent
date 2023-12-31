import React from 'react';

import { Box, Paper, Stack, Typography } from '@mui/material';
import { EditorSchema } from 'reagent-noggin-shared/types/editorSchema';
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
  const { editorSchema } = props;

  return (
    <Stack direction={'row'} spacing={2} alignItems={'top'}>
      <Stack spacing={4} sx={{ flex: 2 }}>
        <Box>
          <Typography variant="h2" mb={2}>
            Model inputs
          </Typography>
          <Paper elevation={2} sx={{ padding: 2 }}>
            <EditorColumn
              inputs={editorSchema.modelInputComponents.map((inputKey) => ({
                inputKey,
                input: editorSchema.allEditorComponents[inputKey],
              }))}
            />
          </Paper>
        </Box>

        <Box>
          <Typography variant="h2" mb={2}>
            Model output
          </Typography>
          <Paper elevation={2} sx={{ padding: 3 }}>
            <ModelOutputEditor
              outputFormats={editorSchema.outputFormats}
              editorComponents={editorSchema.allEditorComponents} // TODO this maybe goes in context or we filter it in the prop-drill
            />
          </Paper>
        </Box>
      </Stack>

      <Stack spacing={2} sx={{ flex: 1 }}>
        <Paper elevation={0} sx={{ padding: 2 }}>
          <AllParameterOptionControls
            documentIds={editorSchema.modelInputComponents}
          />
        </Paper>
      </Stack>
    </Stack>
  );
};

export default Editor;
