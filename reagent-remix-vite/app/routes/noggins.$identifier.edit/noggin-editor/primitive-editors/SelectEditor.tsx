import { MenuItem, Select, Stack } from '@mui/material';
import { ModelInput_Select } from 'reagent-noggin-shared/types/editorSchemaV1';
import { t } from '~/i18n/T.js';
import { I18nString } from '~/shared/i18nString.js';
import { useInputValueState } from '../editor-utils';

export function SelectEditor({
  inputKey,
  input,
}: {
  inputKey: string;
  input: ModelInput_Select;
}) {
  if (input.multiple) {
    return <>Multi-select not implemented</>;
  }

  const [value, setValue] = useInputValueState<string>(inputKey);
  const { options } = input;

  return (
    <Stack
      direction={'row'}
      spacing={3}
      alignItems={'center'}
      justifyContent={'flex-end'}
      sx={{
        mb: 2,
        flex: 1,
      }}
    >
      <Select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        sx={{
          // width: 'auto',
          maxWidth: '100%',
          // flexShrink: 1,
        }}
      >
        {Object.entries(options).map(([key, s]: [string, I18nString]) => (
          <MenuItem key={key} value={key}>
            {t(s)}
          </MenuItem>
        ))}
      </Select>
    </Stack>
  );
}
