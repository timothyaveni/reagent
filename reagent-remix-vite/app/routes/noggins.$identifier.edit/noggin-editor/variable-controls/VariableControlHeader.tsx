import { Stack } from '@mui/material';
import { DocumentVariable } from 'reagent-noggin-shared/types/DocType';
import { NameField } from './NameField';
import { TypeField } from './TypeField';

export function VariableControlHeader({
  variableId,
  variable,
}: {
  variableId: string;
  variable: DocumentVariable;
}) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        mb: 2,
      }}
      alignItems={'end'}
    >
      <NameField variable={variable} />
      <TypeField variableId={variableId} variable={variable} />
    </Stack>
  );
}
