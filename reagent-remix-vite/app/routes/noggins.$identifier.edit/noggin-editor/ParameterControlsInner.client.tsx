import {
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSyncedStore } from '@syncedstore/react';
import {
  DocumentImageParameter,
  DocumentParameter,
  DocumentTextParameter,
} from 'reagent-noggin-shared/types/DocType';
import { uniq } from 'underscore';
import T from '~/i18n/T';
import { useEditorStore } from './editor-utils';

export function ParameterControlsInner({
  documentIds,
}: {
  documentIds: string[];
}) {
  const store = useEditorStore();
  console.log('apoc rerender');
  const documentIdList: string[][] = [];
  for (const documentId of documentIds) {
    documentIdList.push(
      // eslint-disable-next-line react-hooks/rules-of-hooks i promise it's not dynamic
      useSyncedStore(store.documentParameterIdsByDocument)[documentId]!,
    );
  }

  const parameterElementIds = uniq(documentIdList.flat());

  if (parameterElementIds.length === 0) {
    return (
      <>
        <Typography
          variant="body1"
          component="p"
          color="textPrimary"
          gutterBottom
        >
          <T>
            Your prompts don't contain any variables! You can add one by typing
            "@" into the pane to the left.
          </T>
        </Typography>
      </>
    );
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
  console.log({ parameterOptions: JSON.stringify(parameterOptions) });
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
      fullWidth
      sx={{ flex: 2 }}
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
    <FormControl variant="standard" fullWidth sx={{ flex: 1 }}>
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
        fullWidth
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
    <Card elevation={2} key={id} sx={{ my: 2, p: 2 }}>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          mb: 2,
        }}
        alignItems={'end'}
      >
        <NameField parameter={parameter} />
        <TypeField parameterId={id} parameter={parameter} />
      </Stack>

      <TextField
        fullWidth
        sx={{
          mb: 2,
        }}
        // @ts-ignore
        value={parameter.maxLength}
        onChange={(event) => {
          // @ts-ignore
          parameter.maxLength = parseInt(event.target.value);
        }}
        type="number"
        label="Max length"
      />

      <TextField
        fullWidth
        sx={
          {
            // mb: 2,
          }
        }
        // @ts-ignore
        value={parameter.defaultValue}
        onChange={(event) => {
          // @ts-ignore
          parameter.defaultValue = event.target.value;
        }}
        label="Default value"
      />
    </Card>
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
    <Card elevation={2} key={id} sx={{ my: 2, p: 2 }}>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          mb: 2,
        }}
        alignItems={'end'}
      >
        <NameField parameter={parameter} />
        <TypeField parameterId={id} parameter={parameter} />
      </Stack>

      <FormControl variant="standard" fullWidth>
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
    </Card>
  );
}
