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
import T from '~/i18n/T';
import {
  EditorParametersList,
  useEditorParameters,
  useHasPopulatedStore,
} from '../noggins.$identifier.edit/noggin-editor/editor-utils';
import CodeSamples from './CodeSamples';
import './NewRunForm.css';

const NewRunVariablesForm = ({
  parameters,
  parameterValues,
  setParameterValue,
}: {
  parameters: EditorParametersList;
  parameterValues: Record<string, any>;
  setParameterValue: (id: string, value: any) => any;
}) => {
  if (parameters.length === 0) {
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
      {parameters.map(({ id, parameter }) => {
        if (parameter.type === 'image') {
          return (
            <div key={id}>
              <strong>{parameter.name}</strong> is an image parameter, not yet
              implemented in the reagent UI
            </div>
          ); // TODO
        }

        return (
          <div key={id}>
            <TextField
              fullWidth
              name={`_reagent_param_${parameter.name}`}
              label={parameter.name}
              value={parameterValues[id] ?? ''}
              onChange={(e) => {
                setParameterValue(id, e.target.value);
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
  apiKey: string;
  nogginServerUrl: string;
};

export default function NewRunFormWrapper(props: NewRunFormProps) {
  const hasPopulatedStore = useHasPopulatedStore();

  if (!hasPopulatedStore) {
    return <Skeleton />;
  }

  return <NewRunForm {...props} />;
}

const NewRunOverrides = () => {
  return null;
};

function NewRunForm({ noggin, apiKey, nogginServerUrl }: NewRunFormProps) {
  const parameters = useEditorParameters();
  const [parameterValues, setParameterValues] = useState<Record<string, any>>(
    Object.fromEntries(
      // @ts-expect-error look we're just doing a thing here
      parameters.map(({ id, parameter: { defaultValue } }) => [
        id,
        defaultValue || '',
      ]),
    ),
  );

  return (
    <div className="new-run-form">
      <Typography variant="h2" gutterBottom>
        Run this noggin
      </Typography>
      <Grid container spacing={8}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ padding: 2 }}>
            <Form method="post">
              <Box sx={{ mb: 2 }}>
                <NewRunVariablesForm
                  parameters={parameters}
                  parameterValues={parameterValues}
                  setParameterValue={(id, value) => {
                    setParameterValues((old) => ({
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
          <CodeSamples
            noggin={noggin}
            apiKey={apiKey}
            nogginServerUrl={nogginServerUrl}
            parameters={parameters}
            parameterValues={parameterValues}
          />
        </Grid>
      </Grid>
    </div>
  );
}
