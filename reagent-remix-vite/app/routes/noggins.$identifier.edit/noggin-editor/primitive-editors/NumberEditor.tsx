import { Slider, Stack, TextField } from '@mui/material';
import { ModelInput_Number } from 'reagent-noggin-shared/types/editorSchemaV1';
import { useInputValueState } from '../editor-utils';

export function NumberEditor({
  inputKey,
  input,
}: {
  inputKey: string;
  input: ModelInput_Number;
}) {
  const [value, setValue] = useInputValueState<number>(inputKey);
  const { min, max } = input;

  return (
    <Stack
      direction={'row'}
      spacing={3}
      alignItems={'center'}
      sx={{
        mb: 2,
      }}
    >
      <Slider
        sx={{
          flex: 3,
        }}
        size="small"
        min={min}
        max={max}
        value={value}
        marks={[
          { value: min, label: min },
          { value: max, label: max },
        ]}
        step={0.01} // TODO make this configurable? idk
        onChange={(event, value) => {
          setValue(value as number);
        }}
      />
      <TextField
        sx={{
          flex: 1,
        }}
        type="text"
        size="small"
        value={value}
        onChange={(event) => {
          const newValue = +parseFloat(event.target.value).toFixed(2);
          const capped = Math.min(max, Math.max(min, newValue));
          setValue(capped);
        }}
      />
    </Stack>
  );
}
