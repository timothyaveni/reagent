import React from 'react';
import TextEditor from './TextEditor';

interface Props {
  // Define your component's props here
}

const Editor: React.FC<Props> = (props) => {

  return (<>
      <TextEditor documentKey="editor1" />
      <TextEditor documentKey="editor2" />
    </>
  );
};

export default Editor;
