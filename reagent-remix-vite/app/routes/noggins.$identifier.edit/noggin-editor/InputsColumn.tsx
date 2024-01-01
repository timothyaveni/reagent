import { Stack } from '@mui/material';
import { ModelInput } from 'reagent-noggin-shared/types/editorSchema';
import EditorComponentWithHeader from './EditorComponentWithHeader';

export default function InputsColumn({
  inputs,
  column,
}: {
  inputs: {
    inputKey: string;
    input: ModelInput;
  }[];
  column: 'primary' | 'secondary';
}) {
  return (
    <Stack spacing={1}>
      {inputs.map(({ inputKey, input }) => (
        <EditorComponentWithHeader
          key={inputKey}
          inputKey={inputKey}
          input={input}
          column={column}
        />
      ))}
    </Stack>
  );
}
