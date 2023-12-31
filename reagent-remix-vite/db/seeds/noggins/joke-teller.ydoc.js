/** @typedef {import('../../../../noggin-server/src/reagent-noggin-shared/types/DocType').JSONDocType} JSONDocType */

/** @type {JSONDocType} */
const doc = {
  modelInputs: {
    'system-prompt': {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'Your jokes are SUPER funny.' }],
        },
      ],
    },
    'chat-prompt': {
      children: [
        { type: 'chat-turn', speaker: 'user', children: [{ text: '' }] },
        {
          type: 'paragraph',
          children: [
            { text: 'Tell me a joke about ' },
            {
              type: 'parameter',
              parameterId: '18ce8495-a12a-4007-aae9-a93660a13fec',
              children: [{ text: '' }],
            },
            { text: '. Make sure it is SUPER DUPER funny.' },
          ],
        },
      ],
    },
    'output-structure': {
      type: 'string',
    },
    temperature: 1,
    'maximum-completion-length': 512,
  },
  documentParameters: {
    '18ce8495-a12a-4007-aae9-a93660a13fec': {
      name: 'topic',
      type: 'text',
      maxLength: 500,
      defaultValue: '',
    },
  },
  documentParameterIdsByDocument: {
    'system-prompt': [],
    'chat-prompt': ['18ce8495-a12a-4007-aae9-a93660a13fec'],
  },
  nogginOptions: {
    chosenOutputFormatKey: 'chat-text',
  },
  syncState: { synced: true },
};

export default doc;
