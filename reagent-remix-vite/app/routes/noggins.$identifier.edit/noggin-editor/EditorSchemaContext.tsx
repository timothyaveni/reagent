import { createContext } from 'react';
import { EditorSchema } from 'reagent-noggin-shared/types/editorSchema.js';

export const EditorSchemaContext = createContext<EditorSchema>(null as any);
