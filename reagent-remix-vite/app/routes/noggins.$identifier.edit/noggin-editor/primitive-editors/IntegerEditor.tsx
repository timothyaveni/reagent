import { Slider, Stack } from '@mui/material';
import { ModelInput_Integer } from 'reagent-noggin-shared/types/editorSchemaV1';
import {
  TextFieldWithSuspendedEvaluation,
  validateMinMax,
  validateNotNaN,
} from '~/components/TextFieldWithSuspendedEvaluation.js';
import { useInputValueState } from '../editor-utils';

export function IntegerEditor({
  inputKey,
  input,
}: {
  inputKey: string;
  input: ModelInput_Integer;
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
        step={1}
        onChange={(event, value) => {
          setValue(value as number);
        }}
      />
      <TextFieldWithSuspendedEvaluation
        sx={{
          flex: 1,
        }}
        type="text"
        size="small"
        value={value}
        onChange={(value) => {
          setValue(value);
        }}
        parse={(value) => parseInt(value, 10)}
        validations={[validateNotNaN(min), validateMinMax(min, max)]}
      />
    </Stack>
  );
}
