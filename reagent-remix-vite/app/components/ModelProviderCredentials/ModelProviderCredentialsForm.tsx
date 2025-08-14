import { Button, TextField } from '@mui/material';
import { Form } from '@remix-run/react';
import { useState } from 'react';
import T, { t } from '~/i18n/T';
import { I18nString } from '~/shared/i18nString';

import './ModelProviderCredentialsForm.css';

type SingleCredentialType = string;

// Added: allow passing extra optional fields not present in credentialsSchema
type ExtraField = {
  key: string;
  label: string;
  helperText?: string;
};

export function ModelProviderCredentialsForm({
  credentialsSchema,
  currentCredentials,
  onSubmit,
  // Added: new optional prop for extra fields
  extraFields,
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
  // Added
  extraFields?: ExtraField[];
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

        {/* Added: render extra optional fields that are not in credentialsSchema */}
        {extraFields
          ?.filter((f) => !(f.key in credentialsSchema))
          .map((f) => (
            <div
              key={f.key}
              // 新增: 给 base_url 文本框往下挪一点（上方留白）
              style={f.key === 'base_url' ? { marginTop: 12 } : undefined}
            >
              <TextField
                id={f.key}
                label={f.label}
                value={credentials[f.key] ?? ''}
                helperText={f.helperText}
                onChange={(e) => {
                  setCredentials({
                    ...credentials,
                    [f.key]: e.target.value,
                  });
                }}
              />
            </div>
          ))}

        <Button type="submit">
          <T>Save credentials</T>
        </Button>
      </Form>
    </div>
  );
}
