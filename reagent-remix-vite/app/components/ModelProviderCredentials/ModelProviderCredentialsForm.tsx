import { Button, TextField } from '@mui/material';
import { Form } from '@remix-run/react';
import { useState } from 'react';
import T, { t } from '~/i18n/T';
import { I18nString } from '~/shared/i18nString';

import './ModelProviderCredentialsForm.css';

type SingleCredentialType = string;

export function ModelProviderCredentialsForm({
  credentialsSchema,
  currentCredentials,
  onSubmit,
}: {
  credentialsSchema: Record<
    string,
    {
      type: 'string';
      name: I18nString;
    }
  >;
  currentCredentials: Record<string, SingleCredentialType>;
  onSubmit: (credentials: Record<string, SingleCredentialType>) => any;
}) {
  const [credentials, setCredentials] = useState(currentCredentials);

  return (
    <div className="model-provider-credentials-form">
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(credentials);
        }}
      >
        {Object.entries(credentialsSchema).map(([key, value]) => {
          return (
            <div key={key}>
              <TextField
                id={key}
                label={t(value.name)}
                value={credentials[key] ?? ''}
                onChange={(e) => {
                  setCredentials({
                    ...credentials,
                    [key]: e.target.value,
                  });
                }}
              />
            </div>
          );
        })}

        <Button type="submit">
          <T>Save credentials</T>
        </Button>
      </Form>
    </div>
  );
}
