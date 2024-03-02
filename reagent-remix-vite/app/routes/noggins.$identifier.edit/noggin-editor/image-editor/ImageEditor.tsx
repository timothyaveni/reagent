import { Box } from '@mui/material';
import {
  ModelInput_Image,
  ModelInput_Image_Value,
} from 'reagent-noggin-shared/types/editorSchemaV1';
import { SingleImagePresignedInput } from '~/routes/noggins.$identifier.use/SingleImagePresignedInput';
import { useInputValueState } from '../editor-utils';

type ImageEditorProps = {
  inputKey: string;
  input: ModelInput_Image;
};

export function ImageEditor({ inputKey, input }: ImageEditorProps) {
  const [value, setValue] =
    useInputValueState<ModelInput_Image_Value>(inputKey);

  return (
    <Box p={2}>
      <SingleImagePresignedInput
        name={`image_input_${inputKey}`}
        currentUrl={value}
        onFinishUpload={(url) => {
          setValue(url);
        }}
      />
    </Box>
  );
}
