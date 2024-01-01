import { Stack } from '@mui/material';
import {
  ModelInput,
  OutputFormat,
} from 'reagent-noggin-shared/types/editorSchema';
import { MarkdownWithAdmonitions } from '~/components/MarkdownWithAdmonitions/MarkdownWithAdmonitions';
import { t } from '~/i18n/T';

import EditorComponentWithHeader from '../EditorComponentWithHeader';
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
          <EditorComponentWithHeader
            key={inputKey}
            inputKey={inputKey}
            input={input}
            column="primary"
          />
        ))}
      </Stack>
    </div>
  );
}
