import React from 'react';
import TextEditor from './TextEditor';

interface Props {
  // Define your component's props here
}

const Editor: React.FC<Props> = (props) => {

  return (<>  
      <TextEditor documentKey="editor1" textType="plain" />
      <TextEditor documentKey="editor2" textType="chat" />
    </>
  );
};

export default Editor;
