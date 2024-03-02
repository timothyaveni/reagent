import { Card, TextField } from '@mui/material';
import { DocumentNumberVariable } from 'reagent-noggin-shared/types/DocType';
import { VariableControlHeader } from './VariableControlHeader';

export function NumberVariableOptionControls({
  id,
  variable,
}: {
  id: string;
  variable: DocumentNumberVariable;
}) {
  return (
    <Card elevation={2} key={id} sx={{ my: 2, p: 2 }}>
      <VariableControlHeader variableId={id} variable={variable} />
      <TextField
        fullWidth
        value={variable.defaultValue}
        onChange={(event) => {
          const newValue = parseFloat(event.target.value);
          if (isNaN(newValue)) {
            variable.defaultValue = 0;
          } else {
            variable.defaultValue = newValue;
          }
        }}
        label="Default value"
      />
    </Card>
  );
}
