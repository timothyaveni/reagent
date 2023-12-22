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
// question mark help icon
// import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HelpIcon from '@mui/icons-material/Help';

import './Editor.css';
import T, { t } from '../../i18n/T';
import { NogginEditorStore, initializeStoreForNoggin } from './store';
import { WebsocketProvider } from 'y-websocket';
import { useHasPopulatedStore } from './editor-utils';
import { useRevalidator } from '@remix-run/react';

interface Props {
  noggin: {
    id: number;
  };
  authToken: string;
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

  return (
    <StoreContext.Provider value={storeAndWebsocketProvider}>
      <div className="editor">
        <div className="editor-main-column">
          <h2>Model inputs</h2>
          <div className="editor-main-column-header">
            <div className="editor-main-column-header-title">
              <h3>System prompt</h3>
              <Tooltip
                title={
                  <T>
                    You can use the system prompt to give general instructions
                    to the model independent of the specific chat prompt. For
                    example, the system prompt is often used to ask the model to
                    respond politely and factually. Some models pay little
                    attention to the system prompt and should be instructed
                    primarily in the chat prompt.
                  </T>
                }
              >
                <HelpIcon color="action" />
              </Tooltip>
            </div>
            {/* configured on reagent - provided by caller
   - provided by code
   - external
  part of noggin - given to noggin
  pre-configured - uploaded each time
   - specified each time
  pre-loaded
  include in preset
  include in noggin
  */}
            <div className="editor-main-column-header-controls">
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
                    this input, it will be left blank unless your code using
                    this noggin provides a value.
                  </T>
                }
              >
                <HelpIcon color="action" />
              </Tooltip>
            </div>
          </div>
          <TextEditor documentKey="editor1" textType="plain" />

          <div className="editor-main-column-header">
            <div className="editor-main-column-header-title">
              <h3>Chat prompt</h3>
              <Tooltip
                title={
                  <T>
                    {/* todo para styling should clip the top of the first and bottom of the last */}
                    <p>
                      The chat prompt is the main input to the model. It can
                      contain instructions, information, and relevant prior
                      context.
                    </p>
                    <p>
                      Typically, the last item in a prompt is a
                      &ldquo;User&rdquo; section, representing the current
                      query. The model will always respond with an
                      &ldquo;Assistant&rdquo; section.
                    </p>
                    <p>
                      Even if you are not building a chatbot, you can use the
                      chat format to delineate &rdquo;turns&ldquo; taken by the
                      system. &ldquo;User&rdquo; sections do not need to be
                      formatted as natural-language questions.
                    </p>
                    <p>
                      Many of the highest-quality large language models are
                      available only in chat format, so it can be valuable to
                      use chat prompts even if your prompt only ever consists of
                      a single &ldquo;User&rdquo; turn.
                    </p>
                  </T>
                }
              >
                <HelpIcon color="action" />
              </Tooltip>
            </div>
            <div className="editor-main-column-header-controls">
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
                    this input, it will be left blank unless your code using
                    this noggin provides a value.
                  </T>
                }
              >
                <HelpIcon color="action" />
              </Tooltip>
            </div>
          </div>

          <TextEditor
            className="slate-wrapper-main"
            documentKey="editor2"
            textType="chat"
          />
        </div>
        <div className="editor-side-column">
          <AllParameterOptionControls documents={['editor1', 'editor2']} />
        </div>
      </div>
    </StoreContext.Provider>
  );
};

export default Editor;
