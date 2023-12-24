import React from 'react';
import NogginTitleInput from './NogginTitleInput';
import { Tab, Tabs } from '@mui/material';
import T from '~/i18n/T';
import { useMatches, useNavigate } from '@remix-run/react';

import './EditorHeader.css';

interface EditorHeaderProps {
  noggin: any; // TODO
}

const EditorHeader: React.FC<EditorHeaderProps> = ({ noggin }) => {
  const navigate = useNavigate();
  const locationMatches = useMatches();
  console.log({ locationMatches });
  const isEdit = locationMatches.some(
    (match) => match.id === 'routes/noggins.$identifier.edit',
  );
  const isUse = locationMatches.some(
    (match) => match.id === 'routes/noggins.$identifier.use',
  );
  const navValue = isEdit ? 'edit' : isUse ? 'use' : null;

  return (
    <div className="noggin-editor-header">
      <div className="noggin-title-input-wrapper">
        <NogginTitleInput noggin={noggin} />
      </div>

      <div className="noggin-nav-tabs-wrapper">
        <Tabs
          value={navValue}
          onChange={(e, newValue) => {
            console.log({ e, newValue });
            if (newValue === 'edit') {
              navigate(`/noggins/${noggin.slug}/edit`);
            } else if (newValue === 'use') {
              navigate(`/noggins/${noggin.slug}/use`);
            }
          }}
        >
          <Tab value="edit" label={<T>Edit</T>} />
          <Tab value="use" label={<T>Use</T>} />
        </Tabs>
      </div>
    </div>
  );
};

export default EditorHeader;
