type I18nString = {
  en_US: string;
  [ languageCode: string ]: string;
};

type ModelInputType = 'plain-text-with-parameters' | 'chat-text-user-images-with-parameters' | 'chat-text-with-parameters' | 'number' | 'integer';

type ModelInput = {
  name: I18nString;
  description: I18nString;
  type: ModelInputType;
};

type EditorSchemaV1 = {
  schemaVersion: 1;
  allInputs: {
    [ inputKey: string ]: ModelInput;
  },
  modelInputComponents: string[],
  modelParameterComponents: string[],
};

export type EditorSchema = EditorSchemaV1;
