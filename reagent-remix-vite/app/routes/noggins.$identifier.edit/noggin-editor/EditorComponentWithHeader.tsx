import { Help as HelpIcon } from '@mui/icons-material';
import { Box, Tooltip, Typography } from '@mui/material';

import { ModelInput } from 'reagent-noggin-shared/types/editorSchema';
import { MarkdownWithAdmonitions } from '~/components/MarkdownWithAdmonitions/MarkdownWithAdmonitions';
import { t } from '~/i18n/T';
import { AllowOverrideForInputSelector } from './AllowOverrideForInputSelector';
import EditorComponent from './EditorComponent';

export default function EditorComponentWithHeader({
  inputKey,
  input,
  column,
}: {
  inputKey: string;
  input: ModelInput;
  column: 'primary' | 'secondary';
}) {
  return (
    <Box>
      <Box
        alignItems={'center'}
        display="flex"
        mt={1}
        mb={1}
        justifyContent={'space-between'}
      >
        <Box alignItems={'center'} display="flex">
          <Typography variant={column === 'primary' ? 'h3' : 'h4'}>
            {t(input.name)}
          </Typography>
          <Tooltip
            title={
              <Typography variant="body2">
                <MarkdownWithAdmonitions>
                  {t(input.description)}
                </MarkdownWithAdmonitions>
              </Typography>
            }
          >
            {/* TODO i think in theory we wanted this to be markdown, or at least for paragraphs */}
            <HelpIcon
              color="action"
              sx={{
                ml: 3,
              }}
            />
          </Tooltip>
        </Box>
        <AllowOverrideForInputSelector inputKey={inputKey} input={input} />
      </Box>

      <EditorComponent inputKey={inputKey} input={input} />
    </Box>
  );
}
