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
            { text: "Here's a photo from my security camera:\n\n" },
            {
              type: 'parameter',
              parameterId: 'a2c2b3ce-180a-4f64-98eb-0111e8f0302a',
              children: [{ text: '' }],
            },
            {
              text: '\n\nIs the cat in frame? And is he on the couch?\n\nBased on the provided photo, please respond with "no cat", "in frame but not on couch", or "on couch". Do not respond with any words other than one of those three options.',
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
    'a2c2b3ce-180a-4f64-98eb-0111e8f0302a': {
      name: 'image',
      type: 'image',
      openAI_detail: 'low',
    },
  },
  documentParameterIdsByDocument: {
    'system-prompt': [],
    'chat-prompt': ['a2c2b3ce-180a-4f64-98eb-0111e8f0302a'],
  },
  nogginOptions: {
    chosenOutputFormatKey: 'chat-text',
  },
  syncState: { synced: true },
};

export default doc;
