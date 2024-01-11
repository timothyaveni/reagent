import { Chip, Paper, Stack, Typography } from '@mui/material';
import type {
  NogginRevisionOutputSchema,
  NogginRevisionVariables,
} from 'reagent-noggin-shared/types/NogginRevision';

import {
  ArrowForward as ArrowForwardIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import T, { t } from '~/i18n/T';

export default function NogginCardIOSchema({
  variables,
  outputSchema,
}: {
  variables: NogginRevisionVariables | null;
  outputSchema: NogginRevisionOutputSchema | null;
}) {
  if (!variables && !outputSchema) {
    return null;
  }

  return (
    <Stack direction={'row'} spacing={2} alignItems={'center'}>
      <NogginCardInputSchema variables={variables} />
      <ArrowForwardIcon />
      <NogginCardOutputSchema outputSchema={outputSchema} />
    </Stack>
  );
}

function NogginCardInputSchema({
  variables,
}: {
  variables: NogginRevisionVariables | null;
}) {
  if (!variables || !Object.keys(variables).length) {
    return (
      <Paper elevation={1} sx={{ p: 1 }}>
        <T>no variables</T>
      </Paper>
    );
  }

  const shownVariables = Object.values(variables).slice(0, 3);
  if (shownVariables.length < Object.values(variables).length) {
    shownVariables.pop();
    shownVariables.push({
      name: '...',
      type: 'text',
    });
  }

  return (
    <Stack spacing={0.5}>
      {shownVariables.map((variable) => {
        return (
          <div key={variable.name}>
            <Chip
              label={variable.name}
              icon={
                variable.type === 'image' ? (
                  <ImageIcon fontSize="small" />
                ) : undefined
              }
            />
          </div>
        );
      })}
    </Stack>
  );
}

function NogginCardOutputSchema({
  outputSchema,
}: {
  outputSchema: NogginRevisionOutputSchema | null;
}) {
  if (!outputSchema) {
    return null;
  }

  switch (outputSchema.outputFormatType) {
    case 'chat-text':
    case 'completion':
      return (
        <Paper elevation={1} sx={{ p: 1 }}>
          <Typography variant="body2" color="textPrimary">
            <T>text</T>
          </Typography>
        </Paper>
      );
    case 'image':
      return <ImageIcon fontSize="medium" aria-label={t('image output')} />;
    case 'structured-data':
      return (
        <Paper elevation={1} sx={{ p: 1 }}>
          <Typography variant="body2" color="textPrimary">
            <T>structured data</T>
          </Typography>
        </Paper>
      );
    default:
      const _exhaustiveCheck: never = outputSchema.outputFormatType;
  }
}
