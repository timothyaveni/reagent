import {
  ModelInput,
  OutputFormat,
} from 'reagent-noggin-shared/types/editorSchema';
import { MarkdownWithAdmonitions } from '~/components/MarkdownWithAdmonitions';
import { t } from '~/i18n/T';
import EditorComponent from '../EditorComponent';

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
      <MarkdownWithAdmonitions>
        {t(outputFormat.description)}
      </MarkdownWithAdmonitions>

      {editorComponents.map(({ inputKey, input }) => (
        <div key={inputKey}>
          <h3>{t(input.name)}</h3>
          <div>
            <p>{t(input.description)}</p>
          </div>

          <EditorComponent inputKey={inputKey} input={input} />
        </div>
      ))}
    </div>
  );
}
