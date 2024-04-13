import { EditorSchema } from 'reagent-noggin-shared/types/editorSchema.js';

export const editorSchemaPermitsImageVariables = (
  editorSchema: EditorSchema,
): boolean => {
  return Object.values(editorSchema.allEditorComponents).some((component) => {
    return component.type === 'chat-text-user-images-with-parameters';
  });
};
