/** @typedef {import('../../../../noggin-server/src/reagent-noggin-shared/types/DocType').JSONDocType} JSONDocType */

/** @type {JSONDocType} */
const doc = {
  modelInputs: {
    'chat-prompt': {
      children: [
        { type: 'chat-turn', speaker: 'user', children: [{ text: '' }] },
        {
          type: 'paragraph',
          children: [
            { text: 'Given this photo of a nutrition facts label:\n\n' },
            {
              type: 'parameter',
              parameterId: '1f28744a-0772-4915-bd7e-c490ed24b40f',
              children: [{ text: '' }],
            },
            {
              text: "\n\nPlease extract relevant information, if it appears on the label.\n\nIf the product name is visible, or if you think you can tell what the product is, include it in the response object. Otherwise, just leave it out. Use your best judgment about the product name, offering a human-friendly readable version of the name even if that is not exactly what appears on the label.\n\nRespond with JSON corresponding to the Nutrition type definition, as defined below:\n\n```typescript\ntype Value = {\n  value: number;\n  unit: 'grams' | 'milligrams' | 'ounces' | 'servings' | 'other'\n};\n\ntype Nutrition = {\n  product_name?: string;\n  calories_per_serving?: Value;\n  servings_per_container?: Value;\n  serving_size?: Value;\n  total_fat?: Value;\n  cholesterol?: Value;\n  sodium?: Value;\n  total_carbs?: Value;\n  protein?: Value;\n};\n```",
            },
          ],
        },
      ],
    },
    temperature: 0,
    'system-prompt': {
      children: [{ type: 'paragraph', children: [{ text: '' }] }],
    },
    'maximum-completion-length': 512,
  },
  documentParameters: {
    '1f28744a-0772-4915-bd7e-c490ed24b40f': {
      name: 'label',
      type: 'image',
      maxLength: 500,
      defaultValue: '',
      openAI_detail: 'high',
    },
  },
  documentParameterIdsByDocument: {
    'chat-prompt': ['1f28744a-0772-4915-bd7e-c490ed24b40f'],
    'system-prompt': [],
  },
  nogginOptions: { chosenOutputFormatKey: 'chat-text' },
  syncState: { synced: true },
};

export default doc;
