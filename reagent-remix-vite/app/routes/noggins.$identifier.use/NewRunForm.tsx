import {
  Box,
  Button,
  Grid,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Form } from '@remix-run/react';
import { useState } from 'react';
import { EditorSchema } from 'reagent-noggin-shared/types/editorSchema';
import T from '~/i18n/T';
import {
  EditorVariablesList,
  useEditorVariablesAndOverrides,
  useHasPopulatedStore,
} from '../noggins.$identifier.edit/noggin-editor/editor-utils';
import CodeSamples from './CodeSamples';
import './NewRunForm.css';
import { SingleImagePresignedInput } from './SingleImagePresignedInput';

const NewRunVariablesForm = ({
  variables,
  variableValues,
  setVariableValue,
}: {
  variables: EditorVariablesList;
  variableValues: Record<string, any>;
  setVariableValue: (id: string, value: any) => any;
}) => {
  if (variables.length === 0) {
    return (
      <Typography variant="body1">
        {/* todo: change this if we allow overrides */}
        <T>
          This noggin doesn't have any variables, so there's nothing to
          configure here. You can run the noggin directly, but its output may be
          similar from run to run.
        </T>
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="body1">Fill in variables for this run:</Typography>
      {variables.map(({ id, variable: variable }) => {
        if (variable.type === 'image') {
          return (
            <Stack key={id} direction={'row'} spacing={2} alignItems={'center'}>
              {/* todo allow image URL toggle like the noggin server does */}
              <Typography variant="body1">{variable.name}</Typography>
              <SingleImagePresignedInput
                onFinishUpload={(url: string) => {
                  setVariableValue(id, url);
                }}
                currentUrl={variableValues[id]}
                name={`_reagent_param_${variable.name}`}
              />
            </Stack>
          );
        }

        // TODO: we should render number and integer fields differently.
        // for now it's fine because there's coercion from strings everywhere but
        // it's better to use the right kind of field for this input type, maybe abstracted from elsewhere

        return (
          <div key={id}>
            <TextField
              fullWidth
              name={`_reagent_param_${variable.name}`}
              label={variable.name}
              value={variableValues[id] ?? ''}
              onChange={(e) => {
                setVariableValue(id, e.target.value);
              }}
            />
          </div>
        );
      })}
    </Stack>
  );
};

type NewRunFormProps = {
  noggin: any;
  editorSchema: EditorSchema;
  apiKey: string;
  nogginServerUrl: string;
};

export default function NewRunFormWrapper(props: NewRunFormProps) {
  const hasPopulatedStore = useHasPopulatedStore();

  if (!hasPopulatedStore) {
    // todo i really don't like that this entire page is a skeleton .. we'll need to be clever about how we set the editor parameters though
    // definitely get rid of this header duplication
    return (
      <div className="new-run-form">
        <Typography variant="h2" mb={4}>
          Use this noggin
        </Typography>
        <Skeleton variant="rounded" height={400} />
      </div>
    );
  }

  return <NewRunForm {...props} />;
}

const NewRunOverrides = () => {
  return null;
};

function NewRunForm({
  noggin,
  editorSchema,
  apiKey,
  nogginServerUrl,
}: NewRunFormProps) {
  const variables = useEditorVariablesAndOverrides(editorSchema);
  const [variableValues, setVariableValues] = useState<Record<string, any>>(
    Object.fromEntries(
      // @ts-expect-error look we're just doing a thing here
      variables.map(({ id, variable: { defaultValue } }) => [
        id,
        defaultValue ?? '',
      ]),
    ),
  );

  return (
    <div className="new-run-form">
      <Typography variant="h2" mb={4}>
        Use this noggin
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="h3" mb={2}>
            <T>Within reagent:</T>
          </Typography>
          <Paper elevation={2} sx={{ padding: 2 }}>
            <Form method="post">
              <Box sx={{ mb: 2 }}>
                <NewRunVariablesForm
                  variables={variables}
                  variableValues={variableValues}
                  setVariableValue={(id, value) => {
                    setVariableValues((old) => ({
                      ...old,
                      [id]: value,
                    }));
                  }}
                />
                <NewRunOverrides />
              </Box>

              <Box justifyContent={'flex-end'} display={'flex'}>
                <Button variant="outlined" type="submit">
                  Run
                </Button>
              </Box>
            </Form>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h3" mb={2}>
            <T>Or with code:</T>
          </Typography>
          <Paper elevation={2} sx={{ padding: 2 }}>
            <CodeSamples
              noggin={noggin}
              apiKey={apiKey}
              nogginServerUrl={nogginServerUrl}
              variables={variables}
              variableValues={variableValues}
            />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
