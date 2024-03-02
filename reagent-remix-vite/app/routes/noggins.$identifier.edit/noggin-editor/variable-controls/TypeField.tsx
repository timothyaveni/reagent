import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { DocumentVariable } from 'reagent-noggin-shared/types/DocType';
import T from '~/i18n/T';

export function TypeField({
  variableId,
  variable,
}: {
  variableId: string;
  variable: DocumentVariable;
}) {
  // TODO: filter type parameter based on features enabled in editor (img vars?)
  // this will retain old parameter info in the param object, but that's okay. for now, anyway. makes it easier to switch back and forth, if you want to for some reason
  return (
    <FormControl variant="standard" fullWidth sx={{ flex: 1 }}>
      <InputLabel id={`variable-type-field-${variableId}`}>
        <T>Type</T>
      </InputLabel>
      <Select
        label={<T>Type</T>}
        value={variable.type}
        onChange={(event) => {
          const newType = event.target.value as DocumentVariable['type'];
          variable.type = newType;
        }}
        fullWidth
      >
        <MenuItem value="text">
          <T>Text</T>
        </MenuItem>
        <MenuItem value="number">
          <T>Number</T>
        </MenuItem>
        <MenuItem value="integer">
          <T>Integer</T>
        </MenuItem>
        <MenuItem value="image">
          <T>Image</T>
        </MenuItem>
      </Select>
    </FormControl>
  );
}
