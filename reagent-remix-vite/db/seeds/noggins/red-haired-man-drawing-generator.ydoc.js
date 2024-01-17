/** @typedef {import('../../../../noggin-server/src/reagent-noggin-shared/types/DocType').JSONDocType} JSONDocType */

/** @type {JSONDocType} */
const doc = {
  modelInputs: {
    width: 1024,
    height: 1024,
    prompt: {
      children: [
        {
          type: 'paragraph',
          children: [
            {
              text: 'lofi style man in his mid-20s with ginger hair and blue eyes, ',
            },
            {
              type: 'parameter',
              parameterId: '513bca02-f4f5-4746-b16e-97a941e2e6c7',
              children: [{ text: '' }],
            },
            { text: ', lofi, surrounded by plants' },
          ],
        },
      ],
    },
    'inference-steps': 50,
    'negative-prompt': {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'photo, deformed, black and white, realism, disfigured' },
          ],
        },
      ],
    },
  },
  documentParameters: {
    '513bca02-f4f5-4746-b16e-97a941e2e6c7': {
      name: 'input',
      type: 'text',
      maxLength: 500,
      defaultValue: '',
    },
  },
  documentParameterIdsByDocument: {
    prompt: ['513bca02-f4f5-4746-b16e-97a941e2e6c7'],
    'negative-prompt': [],
  },
  nogginOptions: { chosenOutputFormatKey: 'image' },
  syncState: { synced: true },
};

export default doc;
