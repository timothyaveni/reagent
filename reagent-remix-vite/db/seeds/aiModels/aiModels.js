import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const openAiProvider = await prisma.modelProvider.upsert({
    where: {
      name: 'openai',
    },
    update: {},
    create: {
      name: 'openai',
      friendlyName: 'OpenAI',
      credentialsSchemaVersion: 1,
      credentialsSchema: {
        apiKey: {
          type: 'string',
          name: {
            en_US: 'API Key',
          },
        },
      },
      needsCredentials: true,
    },
  });

  const { default: gpt41106PreviewEditorSchema } = await import(
    '../../../../noggin-server/dist/reagent-noggin-shared/editor-schemas/openai/gpt-4-1106-preview.js'
  );

  const gpt41106Preview = await prisma.aIModel.upsert({
    where: {
      modelProviderId_name_revision: {
        modelProviderId: openAiProvider.id,
        name: 'gpt-4-1106-preview',
        revision: '2023-12-22',
      },
    },
    update: {
      editorSchema: gpt41106PreviewEditorSchema,
    },
    create: {
      modelProviderId: openAiProvider.id,
      name: 'gpt-4-1106-preview',
      revision: '2023-12-22',
      editorSchema: gpt41106PreviewEditorSchema,
    },
  });

  const { default: gpt35Turbo1106EditorSchema } = await import(
    '../../../../noggin-server/dist/reagent-noggin-shared/editor-schemas/openai/gpt-3.5-turbo-1106.js'
  );

  const gpt35Turbo1106 = await prisma.aIModel.upsert({
    where: {
      modelProviderId_name_revision: {
        modelProviderId: openAiProvider.id,
        name: 'gpt-3.5-turbo-1106',
        revision: '2023-12-25',
      },
    },
    update: {
      editorSchema: gpt35Turbo1106EditorSchema,
    },
    create: {
      modelProviderId: openAiProvider.id,
      name: 'gpt-3.5-turbo-1106',
      revision: '2023-12-25',
      editorSchema: gpt35Turbo1106EditorSchema,
    },
  });

  const { default: gpt4VisionPreviewEditorSchema } = await import(
    '../../../../noggin-server/dist/reagent-noggin-shared/editor-schemas/openai/gpt-4-vision-preview.js'
  );

  const gpt4VisionPreview = await prisma.aIModel.upsert({
    where: {
      modelProviderId_name_revision: {
        modelProviderId: openAiProvider.id,
        name: 'gpt-4-vision-preview',
        revision: '2023-12-23',
      },
    },
    update: {
      editorSchema: gpt4VisionPreviewEditorSchema,
    },
    create: {
      modelProviderId: openAiProvider.id,
      name: 'gpt-4-vision-preview',
      revision: '2023-12-23',
      editorSchema: gpt4VisionPreviewEditorSchema,
    },
  });

  const replicateProvider = await prisma.modelProvider.upsert({
    where: {
      name: 'replicate',
    },
    update: {},
    create: {
      name: 'replicate',
      friendlyName: 'Replicate',
      credentialsSchemaVersion: 1,
      credentialsSchema: {
        apiToken: {
          type: 'string',
          name: {
            en_US: 'API Token',
          },
        },
      },
      needsCredentials: true,
    },
  });

  const { default: sdxlEditorSchema } = await import(
    '../../../../noggin-server/dist/reagent-noggin-shared/editor-schemas/replicate/sdxl.js'
  );

  const sdxl = await prisma.aIModel.upsert({
    where: {
      modelProviderId_name_revision: {
        modelProviderId: replicateProvider.id,
        name: 'sdxl',
        revision:
          '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b_2023-12-23',
      },
    },
    update: {
      editorSchema: sdxlEditorSchema,
    },
    create: {
      modelProviderId: replicateProvider.id,
      name: 'sdxl',
      revision:
        '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b_2023-12-23',
      editorSchema: sdxlEditorSchema,
    },
  });

  const { default: fofr_sdxlEmojiEditorSchema } = await import(
    '../../../../noggin-server/dist/reagent-noggin-shared/editor-schemas/replicate/fofr_sdxl-emoji.js'
  );

  const fofr_sdxlEmoji = await prisma.aIModel.upsert({
    where: {
      modelProviderId_name_revision: {
        modelProviderId: replicateProvider.id,
        name: 'fofr_sdxl-emoji',
        revision:
          'dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e_2023-12-24',
      },
    },
    update: {
      editorSchema: fofr_sdxlEmojiEditorSchema,
    },
    create: {
      modelProviderId: replicateProvider.id,
      name: 'fofr_sdxl-emoji',
      revision:
        'dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e_2023-12-24',
      editorSchema: fofr_sdxlEmojiEditorSchema,
    },
  });

  const { default: stableDiffusion } = await import(
    '../../../../noggin-server/dist/reagent-noggin-shared/editor-schemas/replicate/stable-diffusion.js'
  );

  const stableDiffusionModel = await prisma.aIModel.upsert({
    where: {
      modelProviderId_name_revision: {
        modelProviderId: replicateProvider.id,
        name: 'stable-diffusion',
        revision:
          'ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4_2.1-2024-03-05',
      },
    },
    update: {
      editorSchema: stableDiffusion,
    },
    create: {
      modelProviderId: replicateProvider.id,
      name: 'stable-diffusion',
      revision:
        'ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4_2.1-2024-03-05',
      editorSchema: stableDiffusion,
    },
  });

  const { default: andreasjansson_llama213bChatJsonSchema } = await import(
    '../../../../noggin-server/dist/reagent-noggin-shared/editor-schemas/replicate/andreasjansson_llama-2-13b-chat-json-schema.js'
  );

  const andreasjansson_llama213bChatJson = await prisma.aIModel.upsert({
    where: {
      modelProviderId_name_revision: {
        modelProviderId: replicateProvider.id,
        name: 'andreasjansson_llama-2-13b-chat-json-schema',
        revision:
          '60ec5dda9ff9ee0b6f786c9d1157842e6ab3cc931139ad98fe99e08a35c5d4d4_2024-01-08',
      },
    },
    update: {
      editorSchema: andreasjansson_llama213bChatJsonSchema,
    },
    create: {
      modelProviderId: replicateProvider.id,
      name: 'andreasjansson_llama-2-13b-chat-json-schema',
      revision:
        '60ec5dda9ff9ee0b6f786c9d1157842e6ab3cc931139ad98fe99e08a35c5d4d4_2024-01-08',
      editorSchema: andreasjansson_llama213bChatJsonSchema,
    },
  });

  const { default: yorickvp_llava13bEditorSchema } = await import(
    '../../../../noggin-server/dist/reagent-noggin-shared/editor-schemas/replicate/yorickvp_llava-13b.js'
  );

  const _yorickvp_llava13b = await prisma.aIModel.upsert({
    where: {
      modelProviderId_name_revision: {
        modelProviderId: replicateProvider.id,
        name: 'yorickvp_llava-13b',
        revision: '2024-03-02',
      },
    },
    update: {
      editorSchema: yorickvp_llava13bEditorSchema,
    },
    create: {
      modelProviderId: replicateProvider.id,
      name: 'yorickvp_llava-13b',
      revision: '2024-03-02',
      editorSchema: yorickvp_llava13bEditorSchema,
    },
  });

  const testProvider = await prisma.modelProvider.upsert({
    where: {
      name: 'test',
    },
    update: {},
    create: {
      name: 'test',
      friendlyName: 'Test',
      credentialsSchemaVersion: 1,
      credentialsSchema: {
        // apiKey: { type: 'string', name: { en_US: 'API Key' } },
      },
      needsCredentials: false,
    },
  });

  const { default: unlimitedBreadsticksEditorSchema } = await import(
    '../../../../noggin-server/dist/reagent-noggin-shared/editor-schemas/test/unlimited-breadsticks.js'
  );

  const unlimitedBreadsticks = await prisma.aIModel.upsert({
    where: {
      modelProviderId_name_revision: {
        modelProviderId: testProvider.id,
        name: 'unlimited-breadsticks',
        revision: '2023-12-26',
      },
    },
    update: {
      editorSchema: unlimitedBreadsticksEditorSchema,
    },
    create: {
      modelProviderId: testProvider.id,
      name: 'unlimited-breadsticks',
      revision: '2023-12-26',
      editorSchema: unlimitedBreadsticksEditorSchema,
    },
  });

  const { default: identiconEditorSchema } = await import(
    '../../../../noggin-server/dist/reagent-noggin-shared/editor-schemas/test/identicon.js'
  );

  const identicon = await prisma.aIModel.upsert({
    where: {
      modelProviderId_name_revision: {
        modelProviderId: testProvider.id,
        name: 'identicon',
        revision: '2023-12-31',
      },
    },
    update: {
      editorSchema: identiconEditorSchema,
    },
    create: {
      modelProviderId: testProvider.id,
      name: 'identicon',
      revision: '2023-12-31',
      editorSchema: identiconEditorSchema,
    },
  });
}

export default main;
