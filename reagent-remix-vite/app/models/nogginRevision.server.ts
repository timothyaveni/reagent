import { prisma } from 'db/db';
import { EditorSchema } from 'reagent-noggin-shared/types/editorSchema';
import * as Y from 'yjs';
import { getNogginEditorSchema_OMNISCIENT } from './noggin.server';

const serializeYDoc = (ydoc: Y.Doc) => {
  const buffer = Buffer.from(Y.encodeStateAsUpdate(ydoc));
  return buffer;
};

const createNogginYjsDoc = (editorSchema: EditorSchema): Y.Doc => {
  const yDoc = new Y.Doc();

  const modelInputs = yDoc.getMap('modelInputs');
  for (const inputKey of Object.keys(editorSchema.allEditorComponents)) {
    const input = editorSchema.allEditorComponents[inputKey];
    switch (input.type) {
      case 'chat-text-user-images-with-parameters':
      case 'chat-text-with-parameters':
        modelInputs.set(inputKey, new Y.XmlText());
        break;
      case 'plain-text-with-parameters':
        modelInputs.set(inputKey, new Y.XmlText(input.default || undefined));
        break;
      case 'integer':
      case 'number':
      case 'boolean':
      case 'select':
        modelInputs.set(inputKey, input.default);
        break;
      case 'simple-schema':
        modelInputs.set(inputKey, input.default);
        break;
    }
  }

  const _overridableModelInputKeys = yDoc.getArray('overridableModelInputKeys');

  const _documentParameters = yDoc.getMap('documentParameters');

  const documentParameterIdsByDocument = yDoc.getMap(
    'documentParameterIdsByDocument',
  );
  for (const inputKey of Object.keys(editorSchema.allEditorComponents)) {
    const input = editorSchema.allEditorComponents[inputKey];
    switch (input.type) {
      case 'chat-text-user-images-with-parameters':
      case 'chat-text-with-parameters':
      case 'plain-text-with-parameters':
        documentParameterIdsByDocument.set(inputKey, new Y.Array());
        break;
      case 'integer':
      case 'number':
      case 'boolean':
      case 'select':
      case 'simple-schema': // TODO ugh how many spots are there to update if we want parameters to work in a thing
        break;
      default:
        // throw ts error if not exhaustive
        const _exhaustiveCheck: never = input;
        break;
    }
  }

  const nogginOptions = yDoc.getMap('nogginOptions');
  nogginOptions.set('chosenOutputFormatKey', editorSchema.outputFormats[0].key);

  const syncState = yDoc.getMap('syncState');
  syncState.set('synced', true);

  return yDoc;
};

export const createInitialRevisionForNoggin_OMNIPOTENT = async (
  nogginId: number,
) => {
  const editorSchema = await getNogginEditorSchema_OMNISCIENT(nogginId);
  const yDoc = createNogginYjsDoc(editorSchema);
  const buffer = serializeYDoc(yDoc);

  await prisma.nogginRevision.create({
    data: {
      content: buffer,
      nogginId,
    },
  });
};
