import React from 'react';
import NogginTitleInput from './NogginTitleInput';

interface EditorHeaderProps {
  noggin: any; // TODO
}

const EditorHeader: React.FC<EditorHeaderProps> = ({ noggin }) => {
  return (
    <div>
      <NogginTitleInput noggin={noggin} />
    </div>
  );
};

export default EditorHeader;
