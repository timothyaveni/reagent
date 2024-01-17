import React from 'react';

import {
  Box,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
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

const ModelInputsBox = ({ editorSchema }: EditorProps) => {
  return (
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
  );
};

const ModelOutputsBox = ({ editorSchema }: EditorProps) => {
  return (
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
  );
};

const ModelParametersBox = ({ editorSchema }: EditorProps) => {
  return (
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
          Tweak the model's behavior here. The default values are reasonable, so
          you dont <em>need</em> to poke around in this section, but you may
          find that your needs are better suited by changing these parameters.
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
  );
};

const Editor: React.FC<EditorProps> = (props) => {
  const { editorSchema } = props;

  const theme = useTheme();
  const isNarrow = useMediaQuery(theme.breakpoints.down('sm'));

  if (!isNarrow) {
    return (
      <Stack direction="row" spacing={3} alignItems="top">
        <Stack spacing={6} sx={{ flex: 2 }}>
          <ModelInputsBox {...props} />
          <ModelOutputsBox {...props} />
        </Stack>

        <Stack spacing={6} sx={{ flex: 1 }}>
          <AllVariableOptionControls
            documentIds={editorSchema.modelInputComponents}
          />
          <ModelParametersBox {...props} />
        </Stack>
      </Stack>
    );
  } else {
    return (
      <Stack spacing={5}>
        <ModelInputsBox {...props} />
        <AllVariableOptionControls
          documentIds={editorSchema.modelInputComponents}
        />
        <ModelOutputsBox {...props} />
        <ModelParametersBox {...props} />
      </Stack>
    );
  }
};

export default Editor;
