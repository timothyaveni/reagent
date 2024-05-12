import { slateNodesToInsertDelta } from '@slate-yjs/core';
import { prisma } from 'db/db';
import { JSONDocType } from 'reagent-noggin-shared/types/DocType.js';
import { EditorSchema } from 'reagent-noggin-shared/types/editorSchema';
import { importDocFromObject } from 'reagent-noggin-shared/ydoc-io/importDocFromJSON';
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
        const plainTextWithParameters = new Y.XmlText();
        const slateNode = {
          type: 'paragraph',
          children: [{ text: input.default || '' }],
        };
        const delta = slateNodesToInsertDelta([slateNode]);
        // this will be 'pending' until it gets added to the ydoc
        plainTextWithParameters.applyDelta(delta, { sanitize: false });

        modelInputs.set(inputKey, plainTextWithParameters);
        break;
      case 'image':
        modelInputs.set(inputKey, input.default ?? '');
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
      default:
        const _exhaustiveCheck: never = input;
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
      case 'image':
      case 'integer':
      case 'number':
      case 'boolean':
      case 'select':
      case 'simple-schema': // TODO ugh how many spots are there to update if we want variables to work in a thing
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

export const createBoostrappedRevisionForNoggin_OMNIPOTENT = async (
  nogginId: number,
  initialRevisionJson: object,
) => {
  const editorSchema = await getNogginEditorSchema_OMNISCIENT(nogginId);
  const ydoc = importDocFromObject(
    editorSchema,
    initialRevisionJson as JSONDocType,
  );
  const buffer = serializeYDoc(ydoc);

  await prisma.nogginRevision.create({
    data: {
      content: buffer,
      nogginId,
    },
  });
};
