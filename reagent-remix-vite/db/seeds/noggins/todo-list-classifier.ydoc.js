/** @typedef {import('../../../../noggin-server/src/reagent-noggin-shared/types/DocType').JSONDocType} JSONDocType */

/** @type {JSONDocType} */
const doc = {
  modelInputs: {
    'system-prompt': {
      children: [
        {
          type: 'paragraph',
          children: [
            {
              text: 'You are a very simple bot, and you only return exactly what was asked in response to queries. You never respond with any explanations. When you do not know the answer, you try your best to answer anyway.',
            },
          ],
        },
      ],
    },
    'chat-prompt': {
      children: [
        { type: 'chat-turn', speaker: 'user', children: [{ text: '' }] },
        {
          type: 'paragraph',
          children: [
            {
              text: 'I have the following item on my TODO list:\n\n"buy crackers"\n\nWhich of these sounds like the most appropriate category for the item?\n\n- personal\n- shopping\n- school\n- work\n\nRespond with ONLY the category name.',
            },
          ],
        },
        { type: 'chat-turn', speaker: 'assistant', children: [{ text: '' }] },
        { type: 'paragraph', children: [{ text: 'shopping' }] },
        { type: 'chat-turn', speaker: 'user', children: [{ text: '' }] },
        {
          type: 'paragraph',
          children: [
            { text: 'Okay, now what about this one?\n\n"' },
            {
              type: 'parameter',
              parameterId: 'c0dc222c-1fd4-40b1-8c68-5a60f90dfe11',
              children: [{ text: '' }],
            },
            { text: '"\n\nAgain, respond with ONLY the category name.' },
          ],
        },
      ],
    },
    'output-structure': {
      type: 'string',
      enum: ['personal', 'shopping', 'school', 'work'],
    },
    temperature: 1,
    'maximum-completion-length': 512,
  },
  documentParameters: {
    'c0dc222c-1fd4-40b1-8c68-5a60f90dfe11': {
      name: 'todo',
      type: 'text',
      maxLength: 500,
      defaultValue: '',
    },
  },
  documentParameterIdsByDocument: {
    'system-prompt': [],
    'chat-prompt': ['c0dc222c-1fd4-40b1-8c68-5a60f90dfe11'],
  },
  nogginOptions: { chosenOutputFormatKey: 'structured-data' },
  syncState: { synced: true },
};

export default doc;
