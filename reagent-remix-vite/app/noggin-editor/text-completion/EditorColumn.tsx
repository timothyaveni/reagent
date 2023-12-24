import HelpIcon from '@mui/icons-material/Help';
import { FormControlLabel, FormGroup, Switch, Tooltip } from '@mui/material';

import TextEditor from './slate/TextEditor';
import T, { t } from '~/i18n/T';
import { ModelInput } from '~/shared/editorSchema';
import EditorComponentWithHeader from './EditorComponentWithHeader';

export default function EditorColumn({
  inputs,
}: {
  inputs: {
    inputKey: string;
    input: ModelInput;
  }[];
}) {
  return (
    <>
      {inputs.map(({ inputKey, input }) => (
        <EditorComponentWithHeader
          key={inputKey}
          inputKey={inputKey}
          input={input}
        />
      ))}
    </>
  );
}
