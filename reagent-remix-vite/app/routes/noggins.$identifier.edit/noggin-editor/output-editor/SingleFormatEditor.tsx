import { Stack } from '@mui/material';
import {
  ModelInput,
  OutputFormat,
} from 'reagent-noggin-shared/types/editorSchema';
import { MarkdownWithAdmonitions } from '~/components/MarkdownWithAdmonitions/MarkdownWithAdmonitions';
import { t } from '~/i18n/T';
import EditorComponent from '../EditorComponent';

import './SingleFormatEditor.css';

export type SingleFormatEditorProps = {
  outputFormat: OutputFormat;
  editorComponents: {
    inputKey: string;
    input: ModelInput;
  }[];
};

export default function SingleFormatEditor({
  outputFormat,
  editorComponents,
}: SingleFormatEditorProps) {
  return (
    <div>
      <div className="format-description">
        <MarkdownWithAdmonitions>
          {t(outputFormat.description)}
        </MarkdownWithAdmonitions>
      </div>

      <Stack spacing={2}>
        {editorComponents.map(({ inputKey, input }) => (
          <div key={inputKey}>
            <h3>{t(input.name)}</h3>
            <div>
              <p>{t(input.description)}</p>
            </div>

            <EditorComponent inputKey={inputKey} input={input} />
          </div>
        ))}
      </Stack>
    </div>
  );
}
