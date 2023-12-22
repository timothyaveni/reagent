import React, { createContext, useEffect, useState } from 'react';
import TextEditor from './TextEditor';
import { AllParameterOptionControls } from './ParameterOptionControls';

import {
  CircularProgress,
  FormControlLabel,
  FormGroup,
  Switch,
  Tooltip,
} from '@mui/material';

import './Editor.css';
import T, { t } from '../../i18n/T';
import { NogginEditorStore, initializeStoreForNoggin } from './store';
import { WebsocketProvider } from 'y-websocket';
import { useHasPopulatedStore } from './editor-utils';
import { useRevalidator } from '@remix-run/react';
import { EditorSchema } from '~/shared/editorSchema';
import EditorColumn from './EditorColumn';

interface Props {
  noggin: {
    id: number;
  };
  authToken: string;
  editorSchema: EditorSchema;
}

// todo dedup types
export const StoreContext = createContext<{
  store: NogginEditorStore | null;
  websocketProvider: WebsocketProvider | null;
}>({
  store: null,
  websocketProvider: null,
});

const Editor: React.FC<Props> = (props) => {
  const [storeAndWebsocketProvider, setStoreAndWebsocketProvider] = useState<{
    store: NogginEditorStore | null;
    websocketProvider: WebsocketProvider | null;
  }>({
    store: null,
    websocketProvider: null,
  });

  const revalidator = useRevalidator();

  useEffect(() => {
    const { store, websocketProvider } = initializeStoreForNoggin(
      {
        id: props.noggin.id,
      },
      props.authToken,
      revalidator.revalidate,
    );

    console.log('store useeffect');
    setStoreAndWebsocketProvider({ store, websocketProvider });
  }, [props.noggin.id, props.authToken]);

  const hasPopulatedStore = useHasPopulatedStore(
    storeAndWebsocketProvider.store,
  );

  if (!hasPopulatedStore) {
    return <CircularProgress />;
  }

  const { editorSchema } = props;
  console.log({ editorSchema });

  return (
    <StoreContext.Provider value={storeAndWebsocketProvider}>
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
          <AllParameterOptionControls documents={editorSchema.modelInputComponents} />
        </div>
      </div>
    </StoreContext.Provider>
  );
};

export default Editor;
