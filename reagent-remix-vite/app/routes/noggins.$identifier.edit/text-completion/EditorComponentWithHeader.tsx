import HelpIcon from '@mui/icons-material/Help';
import { FormControlLabel, FormGroup, Switch, Tooltip } from '@mui/material';

import TextEditor from './slate/TextEditor.client';
import T, { t } from '~/i18n/T';
import { ModelInput } from '~/shared/editorSchema';
import EditorComponent from './EditorComponent';

export default function EditorComponentWithHeader({
  inputKey,
  input,
}: {
  inputKey: string;
  input: ModelInput;
}) {
  return (
    <>
      <div className="editor-header">
        <div className="editor-header-title">
          <h3>{t(input.name)}</h3>
          <Tooltip title={t(input.description)}>
            {/* TODO i think in theory we wanted this to be markdown, or at least for paragraphs */}
            <HelpIcon color="action" />
          </Tooltip>
        </div>
        {/* todo put this back when you feel like it */}
        <div style={{ display: 'none' }}>
          <div className="editor-header-controls">
            {/* todo: collapse the section (but we can keep the prompt around) if unchecked. and sync/store the state, of course! */}
            <FormGroup>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label={t('include in noggin')}
              />
            </FormGroup>
            <Tooltip
              title={
                <T>
                  This text will be used as a default input to the model every
                  time the noggin is used. If you do not include any text for
                  this input, it will be left blank unless your code using this
                  noggin provides a value.
                </T>
              }
            >
              <HelpIcon color="action" />
            </Tooltip>
          </div>
        </div>
      </div>

      <EditorComponent inputKey={inputKey} input={input} />
    </>
  );
}
