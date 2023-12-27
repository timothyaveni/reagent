import { Button, Grid, Skeleton, TextField } from '@mui/material';
import { Form } from '@remix-run/react';
import { useState } from 'react';
import {
  useEditorParameters,
  useHasPopulatedStore,
} from '../noggins.$identifier.edit/text-completion/editor-utils';
import './NewRunForm.css';

const NewRunVariablesFormInner = () => {
  const parameters = useEditorParameters();
  const [parameterValues, setParameterValues] = useState<Record<string, any>>(
    {},
  );

  return (
    <Form method="post">
      {parameters.map(({ id, parameter }) => {
        if (parameter.type === 'image') {
          return (
            <div key={id}>
              {parameter.name} is an image parameter, not yet implemented in the
              reagent UI
            </div>
          ); // TODO
        }

        return (
          <div className="new-run-variable" key={id}>
            <TextField
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
      })}

      <Button type="submit">Run</Button>
    </Form>
  );
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

export default function NewRunForm() {
  return (
    <div className="new-run-form">
      <h2>Run this noggin</h2>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <NewRunVariablesForm />
          <NewRunOverrides />
        </Grid>
        <Grid>http://localhost:2358/noggin?key=asdf</Grid>
      </Grid>
    </div>
  );
}
