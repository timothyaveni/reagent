import { ModelInput } from 'reagent-noggin-shared/types/editorSchema';
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
