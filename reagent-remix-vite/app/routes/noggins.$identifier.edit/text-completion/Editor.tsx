import React, { useContext } from 'react';

import { EditorSchema } from 'reagent-noggin-shared/types/editorSchema';
import { StoreContext } from '~/routes/noggins.$identifier/StoreContext';
import './Editor.css';
import EditorColumn from './EditorColumn';
import { AllParameterOptionControls } from './ParameterOptionControls';

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
