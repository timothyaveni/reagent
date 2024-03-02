import { Card, TextField } from '@mui/material';
import { DocumentIntegerVariable } from 'reagent-noggin-shared/types/DocType';
import { VariableControlHeader } from './VariableControlHeader';

export function IntegerVariableOptionControls({
  id,
  variable,
}: {
  id: string;
  variable: DocumentIntegerVariable;
}) {
  return (
    <Card elevation={2} key={id} sx={{ my: 2, p: 2 }}>
      <VariableControlHeader variableId={id} variable={variable} />
      <TextField
        fullWidth
        value={variable.defaultValue}
        onChange={(event) => {
          const newValue = parseInt(event.target.value, 10);
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
