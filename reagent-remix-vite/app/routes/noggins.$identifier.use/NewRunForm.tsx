import {
  Button,
  Grid,
  Paper,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import { Form } from '@remix-run/react';
import { useState } from 'react';
import {
  useEditorParameters,
  useHasPopulatedStore,
} from '../noggins.$identifier.edit/noggin-editor/editor-utils';
import './NewRunForm.css';

const NewRunVariablesFormInner = () => {
  const parameters = useEditorParameters();
  const [parameterValues, setParameterValues] = useState<Record<string, any>>(
    Object.fromEntries(
      parameters.map(({ id, parameter: { defaultValue } }) => [
        id,
        defaultValue || '',
      ]),
    ),
  );

  return parameters.map(({ id, parameter }) => {
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
          sx={{
            mb: 2,
          }}
          name={`_reagent_param_${parameter.name}`}
          label={parameter.name}
          value={parameterValues[id] ?? ''}
          onChange={(e) => {
            setParameterValues((prev) => ({
              ...prev,
              [id]: e.target.value,
            }));
          }}
        />
      </div>
    );
  });
};

const NewRunVariablesForm = () => {
  const hasPopulatedStore = useHasPopulatedStore();

  if (!hasPopulatedStore) {
    return <Skeleton />;
  }

  return <NewRunVariablesFormInner />;
};

const NewRunOverrides = () => {
  return null;
};

export default function NewRunForm({
  noggin,
  apiKey,
}: {
  noggin: any;
  apiKey: string;
}) {
  return (
    <div className="new-run-form">
      <Typography variant="h2" gutterBottom>
        Run this noggin
      </Typography>
      <Grid container spacing={8}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ padding: 2 }}>
            <Form method="post">
              <NewRunVariablesForm />
              <NewRunOverrides />

              <Button variant="contained" type="submit">
                Run
              </Button>
            </Form>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <code>
            http://localhost:2358/{noggin.slug}?key={apiKey}
          </code>
        </Grid>
      </Grid>
    </div>
  );
}
