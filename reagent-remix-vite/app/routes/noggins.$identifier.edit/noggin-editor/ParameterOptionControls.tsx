import { useSyncedStore } from '@syncedstore/react';

import { uniq } from 'underscore';

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  TextField,
} from '@mui/material';
import T from '~/i18n/T';
import './ParameterControls.css';
import { useEditorStore, useHasPopulatedStore } from './editor-utils';
import {
  DocumentImageParameter,
  DocumentParameter,
  DocumentTextParameter,
} from './store.client';

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
      // eslint-disable-next-line react-hooks/rules-of-hooks i promise it's not dynamic
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
      <ControlsWrapper parameterElementIds={parameterElementIds} />
    </div>
  );
};

function ControlsWrapper({
  parameterElementIds,
}: {
  parameterElementIds: string[];
}) {
  const hasPopulatedStore = useHasPopulatedStore();

  if (!hasPopulatedStore) {
    return <Skeleton variant="rounded" height={200} />;
  }

  return (
    <div className="parameter-controls-wrapper">
      {parameterElementIds.map((id) => (
        <ParameterOptionControls key={id} id={id} />
      ))}
    </div>
  );
}

function ParameterOptionControls({ id }: { id: string }) {
  const store = useEditorStore();
  const parameterOptions = useSyncedStore(store.documentParameters);
  const thisParameter = parameterOptions[id];
  if (!thisParameter) {
    console.log(
      'no parameter options yet',
      id,
      JSON.stringify(parameterOptions),
    );
    return null; // next tick, i think
  }

  // @ts-ignore
  switch (thisParameter.type) {
    case 'image':
      return (
        <ImageParameterOptionControls
          id={id}
          parameter={thisParameter as unknown as DocumentImageParameter}
        />
      );
    case 'text':
    default: // TODO probably get rid of this -- i just didn't want to migrate my test db
      return (
        <TextParameterOptionControls
          id={id}
          parameter={thisParameter as unknown as DocumentTextParameter}
        />
      );
  }

  throw new Error('unknown parameter type');
}

function NameField({ parameter }: { parameter: DocumentParameter }) {
  // TODO: prevent dupes, etc.
  // TODO: also prevent reserved params like 'key'... hmm we don't love this but the idea is simple api even if it's worse practice
  return (
    <TextField
      variant="standard"
      // @ts-ignore
      value={parameter.name}
      onChange={(event) => {
        // @ts-ignore
        parameter.name = event.target.value;
      }}
    />
  );
}

function TypeField({
  parameterId,
  parameter,
}: {
  parameterId: string;
  parameter: DocumentParameter;
}) {
  // this will retain old parameter info in the param object, but that's okay. for now, anyway. makes it easier to switch back and forth, if you want to for some reason
  return (
    <FormControl variant="standard">
      <InputLabel id={`parameter-type-field-${parameterId}`}>
        <T>Type</T>
      </InputLabel>
      <Select
        label={<T>Type</T>}
        value={parameter.type}
        onChange={(event) => {
          // @ts-ignore
          parameter.type = event.target.value;
        }}
      >
        <MenuItem value="text">
          <T>Text</T>
        </MenuItem>
        <MenuItem value="image">
          <T>Image</T>
        </MenuItem>
      </Select>
    </FormControl>
  );
}

function TextParameterOptionControls({
  id,
  parameter,
}: {
  id: string;
  parameter: DocumentTextParameter;
}) {
  // TODO: do not render type parameter if the editor does not have this feature enabled

  return (
    <div key={id} className="parameter-control">
      <NameField parameter={parameter} />
      <TypeField parameterId={id} parameter={parameter} />
      <br />

      <TextField
        // @ts-ignore
        value={parameter.maxLength}
        onChange={(event) => {
          // @ts-ignore
          parameter.maxLength = parseInt(event.target.value);
        }}
        type="number"
        label="Max length"
      />

      <br />

      <TextField
        // @ts-ignore
        value={parameter.defaultValue}
        onChange={(event) => {
          // @ts-ignore
          parameter.defaultValue = event.target.value;
        }}
        label="Default value"
      />
    </div>
  );
}

function ImageParameterOptionControls({
  id,
  parameter,
}: {
  id: string;
  parameter: DocumentImageParameter;
}) {
  return (
    <div key={id} className="parameter-control">
      <NameField parameter={parameter} />
      <TypeField parameterId={id} parameter={parameter} />
      <br />

      <FormControl variant="standard">
        <InputLabel id={`parameter-image-quality-field-${id}`}>
          <T>Image quality</T>
        </InputLabel>
        <Select
          label={<T>Image quality</T>}
          value={parameter.openAI_detail}
          onChange={(event) => {
            // @ts-ignore
            parameter.openAI_detail = event.target.value;
          }}
        >
          <MenuItem value="auto">
            <T>auto</T>
          </MenuItem>
          <MenuItem value="low">
            <T>low</T>
          </MenuItem>
          <MenuItem value="high">
            <T>high</T>
          </MenuItem>
        </Select>
      </FormControl>
    </div>
  );
}
