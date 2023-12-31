import * as Y from 'yjs';

type DocumentBaseParameter = {
  name: string;
};

export interface DocumentTextParameter extends DocumentBaseParameter {
  type: 'text';
  maxLength: number;
  defaultValue: string;
}

export interface DocumentImageParameter extends DocumentBaseParameter {
  type: 'image';
  openAI_detail: 'low' | 'high' | 'auto'; // openai-centric for now. also maybe in the future we do our own scaling in the shim?
}

export type DocumentParameter = DocumentTextParameter | DocumentImageParameter;
type _DPTypeCheck = DocumentParameter['type'];

export type DocType = {
  modelInputs: Record<string, Y.XmlText | any>;
  documentParameters: Record<string, Y.Map<DocumentParameter>>;
  // using Object.keys on documentParameters doesn't trigger a rerender on the index component, so we also keep a list of IDs so that the `push` gets noticed by the rerender logic...
  documentParameterIdsByDocument: Record<string, string[]>;
  nogginOptions: {
    chosenOutputFormatKey: string;
  };
  syncState: {
    synced?: boolean;
  };
};
