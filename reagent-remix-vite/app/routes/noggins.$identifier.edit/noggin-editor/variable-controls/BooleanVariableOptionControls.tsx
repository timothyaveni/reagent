import { Card, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { DocumentBooleanVariable } from 'reagent-noggin-shared/types/DocType';
import T from '~/i18n/T.js';
import { VariableControlHeader } from './VariableControlHeader';

export function BooleanVariableOptionControls({
  id,
  variable,
}: {
  id: string;
  variable: DocumentBooleanVariable;
}) {
  // TODO(kb#257) we may want to let something other than true/false be put into the prompt.
  // the real reason we added boolean variables is for model parameters / overrides, but might
  // as well go all the way and add them as variable types as well
  return (
    <Card elevation={2} key={id} sx={{ my: 2, p: 2 }}>
      <VariableControlHeader variableId={id} variable={variable} />
      <FormControlLabel
        control={
          <Checkbox
            checked={variable.defaultValue}
            onChange={(event) => {
              const newValue = event.target.checked;
              variable.defaultValue = newValue;
            }}
          />
        }
        label={
          <div>
            <Typography>
              <T>Default value</T>
            </Typography>
          </div>
        }
      />
    </Card>
  );
}
