/** @typedef {import('../../../../noggin-server/src/reagent-noggin-shared/types/DocType').JSONDocType} JSONDocType */

/** @type {JSONDocType} */
const doc = {
  modelInputs: {
    'system-prompt': {
      children: [{ type: 'paragraph', children: [{ text: '' }] }],
    },
    'chat-prompt': {
      children: [
        { type: 'chat-turn', speaker: 'user', children: [{ text: '' }] },
        {
          type: 'paragraph',
          children: [
            {
              text: 'Please give me a reasonable HTML hex color code for this color:\n\n"turquoise"\n\nRespond with ONLY the hex code, including the \'#\' at the beginning.',
            },
          ],
        },
        { type: 'chat-turn', speaker: 'assistant', children: [{ text: '' }] },
        { type: 'paragraph', children: [{ text: '#0bc3db' }] },
        { type: 'chat-turn', speaker: 'user', children: [{ text: '' }] },
        {
          type: 'paragraph',
          children: [
            { text: 'Okay, now do this one:\n\n"' },
            {
              type: 'parameter',
              parameterId: 'edd495f3-506d-4f28-bc31-0bb10fc7960d',
              children: [{ text: '' }],
            },
            { text: '"' },
          ],
        },
      ],
    },
    'output-structure': {
      type: 'string',
    },
    temperature: 0,
    'maximum-completion-length': 20,
  },
  overridableModelInputKeys: [],
  documentParameters: {
    'edd495f3-506d-4f28-bc31-0bb10fc7960d': {
      name: 'color-string',
      type: 'text',
      maxLength: 500,
      defaultValue: '',
    },
  },
  documentParameterIdsByDocument: {
    'system-prompt': [],
    'chat-prompt': ['edd495f3-506d-4f28-bc31-0bb10fc7960d'],
  },
  nogginOptions: {
    chosenOutputFormatKey: 'chat-text',
  },
  syncState: { synced: true },
};

export default doc;
