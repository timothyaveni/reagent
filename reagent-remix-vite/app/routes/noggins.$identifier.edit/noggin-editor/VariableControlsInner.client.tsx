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
  DocumentImageVariable,
  DocumentTextVariable,
  DocumentVariable,
} from 'reagent-noggin-shared/types/DocType';
import { uniq } from 'underscore';
import T from '~/i18n/T';
import { useEditorStore } from './editor-utils';

export function VariableControlsInner({
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

  const variableElementIds = uniq(documentIdList.flat());

  if (variableElementIds.length === 0) {
    return (
      <Card sx={{ p: 4, mt: 2 }} elevation={2}>
        <Typography
          variant="body2"
          color="textSecondary"
          align="center"
          gutterBottom
        >
          <T>
            Your prompts don't contain any variables! You can add one by typing
            &ldquo;$&rdquo; into the pane to the left.
          </T>
        </Typography>
      </Card>
    );
  }

  return (
    <div className="variable-controls-wrapper">
      {variableElementIds.map((id) => (
        <VariableOptionControls key={id} id={id} />
      ))}
    </div>
  );
}
function VariableOptionControls({ id }: { id: string }) {
  const store = useEditorStore();
  const variableOptions = useSyncedStore(store.documentParameters);
  console.log({ variableOptions: JSON.stringify(variableOptions) });
  const thisVariable = variableOptions[id];
  if (!thisVariable) {
    console.log('no variable options yet', id, JSON.stringify(variableOptions));
    return null; // next tick, i think
  }

  // @ts-ignore
  switch (thisVariable.type) {
    case 'image':
      return (
        <ImageVariableOptionControls
          id={id}
          variable={thisVariable as unknown as DocumentImageVariable}
        />
      );
    case 'text':
    default: // TODO probably get rid of this -- i just didn't want to migrate my test db
      return (
        <TextVariableOptionControls
          id={id}
          variable={thisVariable as unknown as DocumentTextVariable}
        />
      );
  }

  throw new Error('unknown variable type');
}
function NameField({ variable }: { variable: DocumentVariable }) {
  // TODO: prevent dupes, etc.
  // TODO: also prevent reserved params like 'key'... hmm we don't love this but the idea is simple api even if it's worse practice
  return (
    <FormControl variant="standard" fullWidth sx={{ flex: 2 }}>
      <TextField
        label={<T>Variable name</T>}
        fullWidth
        variant="standard"
        // @ts-ignore
        value={variable.name}
        onChange={(event) => {
          // @ts-ignore
          variable.name = event.target.value;
        }}
      />
    </FormControl>
  );
}
function TypeField({
  variableId,
  variable,
}: {
  variableId: string;
  variable: DocumentVariable;
}) {
  // this will retain old parameter info in the param object, but that's okay. for now, anyway. makes it easier to switch back and forth, if you want to for some reason
  return (
    <FormControl variant="standard" fullWidth sx={{ flex: 1 }}>
      <InputLabel id={`variable-type-field-${variableId}`}>
        <T>Type</T>
      </InputLabel>
      <Select
        label={<T>Type</T>}
        value={variable.type}
        onChange={(event) => {
          // @ts-ignore
          variable.type = event.target.value;
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
function TextVariableOptionControls({
  id,
  variable,
}: {
  id: string;
  variable: DocumentTextVariable;
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
        <NameField variable={variable} />
        <TypeField variableId={id} variable={variable} />
      </Stack>

      <TextField
        fullWidth
        sx={{
          mb: 2,
        }}
        // @ts-ignore
        value={variable.maxLength}
        onChange={(event) => {
          // @ts-ignore
          variable.maxLength = parseInt(event.target.value);
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
        value={variable.defaultValue}
        onChange={(event) => {
          // @ts-ignore
          variable.defaultValue = event.target.value;
        }}
        label="Default value"
      />
    </Card>
  );
}
function ImageVariableOptionControls({
  id,
  variable,
}: {
  id: string;
  variable: DocumentImageVariable;
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
        <NameField variable={variable} />
        <TypeField variableId={id} variable={variable} />
      </Stack>

      <FormControl variant="standard" fullWidth>
        <InputLabel id={`variable-image-quality-field-${id}`}>
          <T>Image quality</T>
        </InputLabel>
        <Select
          label={<T>Image quality</T>}
          value={variable.openAI_detail}
          onChange={(event) => {
            // @ts-ignore
            variable.openAI_detail = event.target.value;
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
