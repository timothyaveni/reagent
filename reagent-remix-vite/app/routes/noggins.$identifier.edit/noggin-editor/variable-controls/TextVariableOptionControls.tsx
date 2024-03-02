import { Card, TextField } from '@mui/material';
import { DocumentTextVariable } from 'reagent-noggin-shared/types/DocType';
import { VariableControlHeader } from './VariableControlHeader';

export function TextVariableOptionControls({
  id,
  variable,
}: {
  id: string;
  variable: DocumentTextVariable;
}) {
  return (
    <Card elevation={2} key={id} sx={{ my: 2, p: 2 }}>
      <VariableControlHeader variableId={id} variable={variable} />

      <TextField
        fullWidth
        sx={{
          mb: 2,
        }}
        // @ts-ignore
        value={variable.maxLength}
        onChange={(event) => {
          // @ts-ignore
          variable.maxLength = parseInt(event.target.value);
        }}
        type="number"
        label="Max length"
      />

      <TextField
        fullWidth
        sx={
          {
            // mb: 2,
          }
        }
        // @ts-ignore
        value={variable.defaultValue}
        onChange={(event) => {
          // @ts-ignore
          variable.defaultValue = event.target.value;
        }}
        label="Default value"
      />
    </Card>
  );
}
