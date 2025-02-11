import { Stack } from '@mui/material';
import { ModelInput } from 'reagent-noggin-shared/types/editorSchema';
import EditorComponentWithHeader from './EditorComponentWithHeader';
import { createContext } from 'react';

export const ModelInputContext = createContext<ModelInput>(null as any);

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
        <ModelInputContext.Provider value={input} key={inputKey}>
          <EditorComponentWithHeader
            inputKey={inputKey}
            input={input}
            column={column}
          />
        </ModelInputContext.Provider>
      ))}
    </Stack>
  );
}
