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
            { text: 'This is a photo of a Christmas tree.\n\n' },
            {
              type: 'parameter',
              parameterId: '7876e4ff-0e40-43cd-ba53-61f088a49c03',
              children: [{ text: '' }],
            },
            {
              text: '\n\nAre the lights of the Christmas tree turned on? I am asking specifically about the tree lights, not any other lights in the room.\n\nRespond either YES or NO. Respond with JUST the one word -- do not say anything else.',
            },
          ],
        },
      ],
    },
    temperature: 1,
    'maximum-completion-length': 512,
  },
  documentParameters: {
    '7876e4ff-0e40-43cd-ba53-61f088a49c03': {
      name: 'image',
      type: 'image',
      openAI_detail: 'low',
    },
  },
  documentParameterIdsByDocument: {
    'system-prompt': [],
    'chat-prompt': ['7876e4ff-0e40-43cd-ba53-61f088a49c03'],
  },
  nogginOptions: {
    chosenOutputFormatKey: 'chat-text',
  },
  syncState: { synced: true },
};

export default doc;
