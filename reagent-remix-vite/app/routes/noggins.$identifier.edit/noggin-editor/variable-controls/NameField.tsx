import { FormControl, TextField } from '@mui/material';
import { DocumentVariable } from 'reagent-noggin-shared/types/DocType';
import T from '~/i18n/T';

export function NameField({ variable }: { variable: DocumentVariable }) {
  // TODO: prevent dupes, etc.
  // TODO: also prevent reserved params like 'key'... hmm we don't love this but the idea is simple api even if it's worse practice
  return (
    <FormControl variant="standard" fullWidth sx={{ flex: 2 }}>
      <TextField
        label={<T>Variable name</T>}
        fullWidth
        variant="standard"
        // @ts-ignore
        value={variable.name}
        onChange={(event) => {
          // @ts-ignore
          variable.name = event.target.value;
        }}
      />
    </FormControl>
  );
}
