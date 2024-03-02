import { Card, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { DocumentImageVariable } from 'reagent-noggin-shared/types/DocType';
import T from '~/i18n/T';
import { VariableControlHeader } from './VariableControlHeader';

export function ImageVariableOptionControls({
  id,
  variable,
}: {
  id: string;
  variable: DocumentImageVariable;
}) {
  return (
    <Card elevation={2} key={id} sx={{ my: 2, p: 2 }}>
      <VariableControlHeader variableId={id} variable={variable} />

      <FormControl variant="standard" fullWidth>
        <InputLabel id={`variable-image-quality-field-${id}`}>
          <T>Image quality</T>
        </InputLabel>
        <Select
          label={<T>Image quality</T>}
          value={variable.openAI_detail}
          onChange={(event) => {
            variable.openAI_detail = event.target
              .value as DocumentImageVariable['openAI_detail'];
          }}
        >
          <MenuItem value="auto">
            <T>auto</T>
          </MenuItem>
          <MenuItem value="low">
            <T>low</T>
          </MenuItem>
          <MenuItem value="high">
            <T>high</T>
          </MenuItem>
        </Select>
      </FormControl>
    </Card>
  );
}
