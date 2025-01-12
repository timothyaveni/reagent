import { Checkbox, Stack } from '@mui/material';
import { ModelInput_Boolean } from 'reagent-noggin-shared/types/editorSchemaV1';
import { useInputValueState } from '../editor-utils';

export function BooleanEditor({
  inputKey,
  input,
}: {
  inputKey: string;
  input: ModelInput_Boolean;
}) {
  const [value, setValue] = useInputValueState<boolean>(inputKey);

  return (
    <Stack
      direction={'row'}
      spacing={3}
      alignItems={'center'}
      justifyContent={'flex-start'}
      sx={{
        mb: 2,
        pl: 4,
      }}
    >
      <Checkbox
        sx={
          {
            // flex: 3,
          }
        }
        checked={value}
        onChange={(event, checked) => {
          setValue(checked);
        }}
      />
    </Stack>
  );
}
