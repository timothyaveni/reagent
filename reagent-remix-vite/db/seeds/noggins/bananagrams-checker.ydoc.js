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
              text: 'Below is a photo of a finished Bananagrams game board.\n\n',
            },
            {
              type: 'parameter',
              parameterId: 'f9dc04c1-a2da-47dc-b4de-ad040e1ff48e',
              children: [{ text: '' }],
            },
            {
              text: '\n\nPlease list all the words in the game board. For each word, identify whether it is a real word and, if so, give the definition.',
            },
          ],
        },
      ],
    },
    temperature: 1,
    'maximum-completion-length': 512,
  },
  overridableModelInputKeys: [],
  documentParameters: {
    'f9dc04c1-a2da-47dc-b4de-ad040e1ff48e': {
      name: 'image',
      type: 'image',
      openAI_detail: 'low',
    },
  },
  documentParameterIdsByDocument: {
    'system-prompt': [],
    'chat-prompt': ['f9dc04c1-a2da-47dc-b4de-ad040e1ff48e'],
  },
  nogginOptions: {
    chosenOutputFormatKey: 'chat-text',
  },
  syncState: { synced: true },
};

export default doc;
