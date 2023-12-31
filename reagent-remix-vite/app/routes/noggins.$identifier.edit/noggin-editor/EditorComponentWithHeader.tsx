import { Help as HelpIcon } from '@mui/icons-material';
import { Box, Tooltip, Typography } from '@mui/material';

import { ModelInput } from 'reagent-noggin-shared/types/editorSchema';
import { t } from '~/i18n/T';
import EditorComponent from './EditorComponent';

export default function EditorComponentWithHeader({
  inputKey,
  input,
}: {
  inputKey: string;
  input: ModelInput;
}) {
  return (
    <>
      <div className="editor-header">
        <Box alignItems={'center'} display="flex" mt={1}>
          <Typography variant="h3" component="h3">
            {t(input.name)}
          </Typography>
          <Tooltip title={t(input.description)}>
            {/* TODO i think in theory we wanted this to be markdown, or at least for paragraphs */}
            <HelpIcon
              color="action"
              sx={{
                ml: 3,
              }}
            />
          </Tooltip>
        </Box>
      </div>

      <EditorComponent inputKey={inputKey} input={input} />
    </>
  );
}
