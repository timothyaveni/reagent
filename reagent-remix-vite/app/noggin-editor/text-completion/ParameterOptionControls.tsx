import { useSyncedStore } from '@syncedstore/react';

import { uniq } from 'underscore';

import './ParameterControls.css';
import { Button, TextField } from '@mui/material';
import T from '../../i18n/T';
import { useContext } from 'react';
import { StoreContext } from './Editor.client';
import { useEditorStore } from './editor-utils';

type Props = {
  // for now this is a prop, but it won't actually change throughout the lifetime of the app
  // (i'm making the call now that changing the model/schema will require at least a page reload, at least for v0)
  // what this means is that we can safely use this as a way to call into hooks, but we might get in trouble with a linter
  documents: string[];
};

export const AllParameterOptionControls = (props: Props) => {
  const store = useEditorStore();
  console.log('apoc rerender');
  const documentIdList: string[][] = [];
  for (const documentId of props.documents) {
    documentIdList.push(
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useSyncedStore(store.documentParameterIdsByDocument)[documentId]!,
    );
  }

  const parameterElementIds = uniq(documentIdList.flat());

  return (
    <div>
      <h2>Input variables</h2>
      <p>
        <T>
          These variables can be used in text prompts. When using the noggin,
          you can provide values for these variables, and they will be inserted
          into the text prompts you write here.
        </T>
      </p>
      {parameterElementIds.length === 0 && (
        <>
          <p>
            <T>
              Your prompts don't contain any variables! You can add one by
              typing "@" into the pane to the left.
            </T>
          </p>

          {/* TODO */}
          {/* <Button variant="outlined">
            <T>Add one</T>
          </Button> */}
        </>
      )}
      {parameterElementIds.map((id) => {
        return <ParameterOptionControls id={id} key={id} />;
      })}
    </div>
  );
};

function ParameterOptionControls({ id }: { id: string }) {
  const store = useEditorStore();
  const parameterOptions = useSyncedStore(store.documentParameters);
  if (!parameterOptions[id]) {
    console.log(
      'no parameter options yet',
      id,
      JSON.stringify(parameterOptions),
    );
    return null; // next tick, i think
  }

  const thisParameter = parameterOptions[id];

  return (
    <div key={id} className="parameter-control">
      <TextField
        variant="standard"
        // @ts-ignore
        value={thisParameter.name}
        onChange={(event) => {
          // @ts-ignore
          thisParameter.name = event.target.value;
        }}
      />
      <br />

      <TextField
        // @ts-ignore
        value={thisParameter.maxLength}
        onChange={(event) => {
          // @ts-ignore
          thisParameter.maxLength = parseInt(event.target.value);
        }}
        type="number"
        label="Max length"
      />

      <br />

      <TextField
        // @ts-ignore
        value={thisParameter.defaultValue}
        onChange={(event) => {
          // @ts-ignore
          thisParameter.defaultValue = event.target.value;
        }}
        label="Default value"
      />
    </div>
  );
}
