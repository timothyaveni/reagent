import { Tab, Tabs } from '@mui/material';
import { useLoaderData, useMatches, useNavigate } from '@remix-run/react';
import React from 'react';
import T from '~/i18n/T';
import NogginTitleInput from './NogginTitleInput';

import './EditorHeader.css';
import { NogginRouteLoaderType } from './route';

const EditorHeader: React.FC = () => {
  const { noggin } = useLoaderData<NogginRouteLoaderType>();
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
        {/* TODO hmm for some reason this loads after hydration / after you click on it */}
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
