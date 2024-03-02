/** @typedef {import('../../../../noggin-server/src/reagent-noggin-shared/types/DocType').JSONDocType} JSONDocType */

/** @type {JSONDocType} */
const doc = {
  modelInputs: {
    prompt: {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'white and black icon of "' },
            {
              type: 'parameter',
              parameterId: 'a1749c6d-fe4d-47dc-931f-d75dd6f07723',
              children: [{ text: '' }],
            },
            { text: '", white background, black lineart, simple, large' },
          ],
        },
      ],
    },
    'negative-prompt': {
      children: [{ type: 'paragraph', children: [{ text: '' }] }],
    },
    width: 1024,
    height: 1024,
    'inference-steps': 40,
  },
  overridableModelInputKeys: [],
  documentParameters: {
    'a1749c6d-fe4d-47dc-931f-d75dd6f07723': {
      type: 'text',
      name: 'item',
      maxLength: 500,
      defaultValue: '',
    },
  },
  documentParameterIdsByDocument: {
    prompt: ['a1749c6d-fe4d-47dc-931f-d75dd6f07723'],
    'negative-prompt': [],
  },
  nogginOptions: {
    chosenOutputFormatKey: 'image',
  },
  syncState: { synced: true },
};

export default doc;
