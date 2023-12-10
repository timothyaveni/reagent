import React from 'react';
import TextEditor from './TextEditor';
import { AllParameterOptionControls } from './ParameterOptionControls';

interface Props {
  // Define your component's props here
}

const Editor: React.FC<Props> = (props) => {
  return (
    <>
      <TextEditor documentKey="editor1" textType="plain" />
      <TextEditor documentKey="editor2" textType="chat" />
      <AllParameterOptionControls documents={['editor1', 'editor2']} />
    </>
  );
};

export default Editor;
