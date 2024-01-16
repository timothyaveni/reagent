import React from 'react';

import { Box, Paper, Stack, Typography } from '@mui/material';
import { EditorSchema } from 'reagent-noggin-shared/types/editorSchema';
import T from '~/i18n/T';
import InputsColumn from './InputsColumn';
import { AllVariableOptionControls } from './VariableOptionControls';
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
    <Stack direction="row" spacing={3} alignItems="top">
      <Stack spacing={6} sx={{ flex: 2 }}>
        <Box>
          <Typography variant="h2" mb={2}>
            Model inputs
          </Typography>
          <Paper elevation={2} sx={{ padding: 2 }}>
            <InputsColumn
              inputs={editorSchema.modelInputComponents.map((inputKey) => ({
                inputKey,
                input: editorSchema.allEditorComponents[inputKey],
              }))}
              column="primary"
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

      <Stack spacing={6} sx={{ flex: 1 }}>
        <AllVariableOptionControls
          documentIds={editorSchema.modelInputComponents}
        />
        <Box>
          <Typography variant="h2" gutterBottom>
            Model parameters
          </Typography>
          <Typography
            variant="body2"
            component="p"
            color="textSecondary"
            // gutterBottom
            mb={2}
          >
            <T flagged>
              Tweak the model's behavior here. The default values are
              reasonable, so you dont <em>need</em> to poke around in this
              section, but you may find that your needs are better suited by
              changing these parameters.
            </T>
          </Typography>
          <Paper elevation={2} sx={{ padding: 2 }}>
            <InputsColumn
              inputs={editorSchema.modelParameterComponents.map((inputKey) => ({
                inputKey,
                input: editorSchema.allEditorComponents[inputKey],
              }))}
              column="secondary"
            />
          </Paper>
        </Box>
      </Stack>
    </Stack>
  );
};

export default Editor;
