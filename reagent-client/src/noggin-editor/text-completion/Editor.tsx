import React from 'react';
import TextEditor from './TextEditor';
import { AllParameterOptionControls } from './ParameterOptionControls';

import './Editor.css';

interface Props {
  // Define your component's props here
}

const Editor: React.FC<Props> = (props) => {
  return (
    <div className="editor">
      <div className="editor-main-column">
        <h2>System prompt</h2>
        <TextEditor documentKey="editor1" textType="plain" />
        <h2>Chat prompt</h2>
        <TextEditor className="slate-wrapper-main" documentKey="editor2" textType="chat" />
      </div>
      <div className="editor-side-column">
        <AllParameterOptionControls documents={['editor1', 'editor2']} />
        
      </div>
    </div>
  );
};

export default Editor;
