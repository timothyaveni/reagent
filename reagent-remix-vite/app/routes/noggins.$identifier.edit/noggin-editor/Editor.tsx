import React, { useContext } from 'react';

import { EditorSchema } from 'reagent-noggin-shared/types/editorSchema';
import { StoreContext } from '~/routes/noggins.$identifier/StoreContext';
import './Editor.css';
import EditorColumn from './EditorColumn';
import { AllParameterOptionControls } from './ParameterOptionControls';
import { ModelOutputEditor } from './output-editor/ModelOutputEditor';

export interface EditorProps {
  noggin: {
    id: number;
  };
  editorSchema: EditorSchema;
}

const Editor: React.FC<EditorProps> = (props) => {
  const { store } = useContext(StoreContext);

  const { editorSchema } = props;
  console.log({ editorSchema });

  return (
    <div className="editor">
      <div className="editor-main-column">
        <h2>Model inputs</h2>
        <EditorColumn
          inputs={editorSchema.modelInputComponents.map((inputKey) => ({
            inputKey,
            input: editorSchema.allEditorComponents[inputKey],
          }))}
        />

        <h2>Model output</h2>
        <ModelOutputEditor
          outputFormats={editorSchema.outputFormats}
          editorComponents={editorSchema.allEditorComponents} // TODO this maybe goes in context or we filter it in the prop-drill
        />
      </div>
      <div className="editor-side-column">
        <AllParameterOptionControls
          documents={editorSchema.modelInputComponents}
        />
      </div>
    </div>
  );
};

export default Editor;
