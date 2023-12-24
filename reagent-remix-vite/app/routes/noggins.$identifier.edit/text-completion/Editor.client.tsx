import React, { useContext } from 'react';
import { AllParameterOptionControls } from './ParameterOptionControls';

import { CircularProgress } from '@mui/material';

import './Editor.css';
import { useHasPopulatedStore } from './editor-utils';
import { EditorSchema } from '~/shared/editorSchema';
import EditorColumn from './EditorColumn';
import { StoreContext } from '~/routes/noggins.$identifier/StoreContext';

export interface EditorProps {
  noggin: {
    id: number;
  };
  editorSchema: EditorSchema;
}

const Editor: React.FC<EditorProps> = (props) => {
  const { store } = useContext(StoreContext);

  const hasPopulatedStore = useHasPopulatedStore(store);

  if (!hasPopulatedStore) {
    return <CircularProgress />; // todo this looks like shit
  }

  const { editorSchema } = props;
  console.log({ editorSchema });

  return (
    <div className="editor">
      <div className="editor-main-column">
        <h2>Model inputs</h2>
        <EditorColumn
          inputs={editorSchema.modelInputComponents.map((inputKey) => ({
            inputKey,
            input: editorSchema.allInputs[inputKey],
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
