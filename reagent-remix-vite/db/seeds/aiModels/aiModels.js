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

  const { default: gpt35Turbo0125EditorSchema } = await import(
    '../../../../noggin-server/dist/reagent-noggin-shared/editor-schemas/openai/gpt-3.5-turbo-0125.js'
  );

  const gpt35Turbo0125 = await prisma.aIModel.upsert({
    where: {
      modelProviderId_name_revision: {
        modelProviderId: openAiProvider.id,
        name: 'gpt-3.5-turbo-0125',
        revision: '2024-03-05',
      },
    },
    update: {
      editorSchema: gpt35Turbo0125EditorSchema,
    },
    create: {
      modelProviderId: openAiProvider.id,
      name: 'gpt-3.5-turbo-0125',
      revision: '2024-03-05',
      editorSchema: gpt35Turbo0125EditorSchema,
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

  const { default: gpt4Turbo20240409EditorSchema } = await import(
    '../../../../noggin-server/dist/reagent-noggin-shared/editor-schemas/openai/gpt-4-turbo-2024-04-09.js'
  );

  const gpt4Turbo20240409 = await prisma.aIModel.upsert({
    where: {
      modelProviderId_name_revision: {
        modelProviderId: openAiProvider.id,
        name: 'gpt-4-turbo-2024-04-09',
        revision: '2024-04-09',
      },
    },
    update: {
      editorSchema: gpt4Turbo20240409EditorSchema,
    },
    create: {
      modelProviderId: openAiProvider.id,
      name: 'gpt-4-turbo-2024-04-09',
      revision: '2024-04-09',
      editorSchema: gpt4Turbo20240409EditorSchema,
    },
  });

  const { default: gpt4o20240513EditorSchema } = await import(
    '../../../../noggin-server/dist/reagent-noggin-shared/editor-schemas/openai/gpt-4o-2024-05-13.js'
  );

  const gpt4o20240513 = await prisma.aIModel.upsert({
    where: {
      modelProviderId_name_revision: {
        modelProviderId: openAiProvider.id,
        name: 'gpt-4o-2024-05-13',
        revision: '2024-05-13',
      },
    },
    update: {
      editorSchema: gpt4o20240513EditorSchema,
    },
    create: {
      modelProviderId: openAiProvider.id,
      name: 'gpt-4o-2024-05-13',
      revision: '2024-05-13',
      editorSchema: gpt4o20240513EditorSchema,
    },
  });

  const { default: gpt4oMini20240718EditorSchema } = await import(
    '../../../../noggin-server/dist/reagent-noggin-shared/editor-schemas/openai/gpt-4o-mini-2024-07-18.js'
  );

  const _gpt4oMini20240718 = await prisma.aIModel.upsert({
    where: {
      modelProviderId_name_revision: {
        modelProviderId: openAiProvider.id,
        name: 'gpt-4o-mini-2024-07-18',
        revision: '2024-07-18',
      },
    },
    update: {
      editorSchema: gpt4oMini20240718EditorSchema,
    },
    create: {
      modelProviderId: openAiProvider.id,
      name: 'gpt-4o-mini-2024-07-18',
      revision: '2024-07-18',
      editorSchema: gpt4oMini20240718EditorSchema,
    },
  });

  const { default: gpt4o20240806EditorSchema } = await import(
    '../../../../noggin-server/dist/reagent-noggin-shared/editor-schemas/openai/gpt-4o-2024-08-06.js'
  );

  const _gpt4o20240806 = await prisma.aIModel.upsert({
    where: {
      modelProviderId_name_revision: {
        modelProviderId: openAiProvider.id,
        name: 'gpt-4o-2024-08-06',
        revision: '2024-08-06',
      },
    },
    update: {
      editorSchema: gpt4o20240806EditorSchema,
    },
    create: {
      modelProviderId: openAiProvider.id,
      name: 'gpt-4o-2024-08-06',
      revision: '2024-08-06',
      editorSchema: gpt4o20240806EditorSchema,
    },
  });

  const { default: o3Mini20250131EditorSchema } = await import(
    '../../../../noggin-server/dist/reagent-noggin-shared/editor-schemas/openai/o3-mini-2025-01-31.js'
  );

  const _o3Mini20250131 = await prisma.aIModel.upsert({
    where: {
      modelProviderId_name_revision: {
        modelProviderId: openAiProvider.id,
        name: 'o3-mini-2025-01-31',
        revision: '2025-01-31',
      },
    },
    update: {
      editorSchema: o3Mini20250131EditorSchema,
    },
    create: {
      modelProviderId: openAiProvider.id,
      name: 'o3-mini-2025-01-31',
      revision: '2025-01-31',
      editorSchema: o3Mini20250131EditorSchema,
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

  const { default: bytedance_sdxlLightning4StepEditorSchema } = await import(
    '../../../../noggin-server/dist/reagent-noggin-shared/editor-schemas/replicate/bytedance_sdxl-lightning-4step.js'
  );

  const _bytedance_sdxlLightning4Step = await prisma.aIModel.upsert({
    where: {
      modelProviderId_name_revision: {
        modelProviderId: replicateProvider.id,
        name: 'bytedance_sdxl-lightning-4step',
        revision:
          '727e49a643e999d602a896c774a0658ffefea21465756a6ce24b7ea4165eba6a_2024-04-18',
      },
    },
    update: {
      editorSchema: bytedance_sdxlLightning4StepEditorSchema,
    },
    create: {
      modelProviderId: replicateProvider.id,
      name: 'bytedance_sdxl-lightning-4step',
      revision:
        '727e49a643e999d602a896c774a0658ffefea21465756a6ce24b7ea4165eba6a_2024-04-18',
      editorSchema: bytedance_sdxlLightning4StepEditorSchema,
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

  const { default: metaLlama370BInstructEditorSchema } = await import(
    '../../../../noggin-server/dist/reagent-noggin-shared/editor-schemas/replicate/meta-llama-3-70b-instruct.js'
  );

  const _metaLlama370BInstruct = await prisma.aIModel.upsert({
    where: {
      modelProviderId_name_revision: {
        modelProviderId: replicateProvider.id,
        name: 'meta-llama-3-70b-instruct',
        revision: '2024-04-24',
      },
    },
    update: {
      editorSchema: metaLlama370BInstructEditorSchema,
    },
    create: {
      modelProviderId: replicateProvider.id,
      name: 'meta-llama-3-70b-instruct',
      revision: '2024-04-24',
      editorSchema: metaLlama370BInstructEditorSchema,
    },
  });

  const { default: metaLlama31405BInstructEditorSchema } = await import(
    '../../../../noggin-server/dist/reagent-noggin-shared/editor-schemas/replicate/meta-llama-3-1-405b-instruct.js'
  );

  const _metaLlama31405BInstruct = await prisma.aIModel.upsert({
    where: {
      modelProviderId_name_revision: {
        modelProviderId: replicateProvider.id,
        name: 'meta-llama-3-1-405b-instruct',
        revision: '2024-10-17',
      },
    },
    update: {
      editorSchema: metaLlama31405BInstructEditorSchema,
    },
    create: {
      modelProviderId: replicateProvider.id,
      name: 'meta-llama-3-1-405b-instruct',
      revision: '2024-10-17',
      editorSchema: metaLlama31405BInstructEditorSchema,
    },
  });

  const { default: metaLlama370BBaseEditorSchema } = await import(
    '../../../../noggin-server/dist/reagent-noggin-shared/editor-schemas/replicate/meta-llama-3-70b-base.js'
  );

  const _metaLlama370BBase = await prisma.aIModel.upsert({
    where: {
      modelProviderId_name_revision: {
        modelProviderId: replicateProvider.id,
        name: 'meta-llama-3-70b-base',
        revision: '2024-10-17',
      },
    },
    update: {
      editorSchema: metaLlama370BBaseEditorSchema,
    },
    create: {
      modelProviderId: replicateProvider.id,
      name: 'meta-llama-3-70b-base',
      revision: '2024-10-17',
      editorSchema: metaLlama370BBaseEditorSchema,
    },
  });

  const { default: blackForestLabsFlux11ProEditorSchema } = await import(
    '../../../../noggin-server/dist/reagent-noggin-shared/editor-schemas/replicate/black-forest-labs_flux-1-1-pro.js'
  );

  const _blackForestLabsFlux11Pro = await prisma.aIModel.upsert({
    where: {
      modelProviderId_name_revision: {
        modelProviderId: replicateProvider.id,
        name: 'black-forest-labs_flux-1.1-pro',
        revision: '2024-10-06',
      },
    },
    update: {
      editorSchema: blackForestLabsFlux11ProEditorSchema,
    },
    create: {
      modelProviderId: replicateProvider.id,
      name: 'black-forest-labs_flux-1.1-pro',
      revision: '2024-10-06',
      editorSchema: blackForestLabsFlux11ProEditorSchema,
    },
  });

  const { default: blackForestLabsFlux1SchellEditorSchema } = await import(
    '../../../../noggin-server/dist/reagent-noggin-shared/editor-schemas/replicate/black-forest-labs_flux-1-schnell.js'
  );

  const _blackForestLabsFlux1Schell = await prisma.aIModel.upsert({
    where: {
      modelProviderId_name_revision: {
        modelProviderId: replicateProvider.id,
        name: 'black-forest-labs_flux-1-schnell',
        revision: '2024-10-06',
      },
    },
    update: {
      editorSchema: blackForestLabsFlux1SchellEditorSchema,
    },
    create: {
      modelProviderId: replicateProvider.id,
      name: 'black-forest-labs_flux-1-schnell',
      revision: '2024-10-06',
      editorSchema: blackForestLabsFlux1SchellEditorSchema,
    },
  });

  const { default: pharmapsychoticClipInterrogatorEditorSchema } = await import(
    '../../../../noggin-server/dist/reagent-noggin-shared/editor-schemas/replicate/pharmapsychotic_clip-interrogator.js'
  );

  const _pharmapsychoticClipInterrogator = await prisma.aIModel.upsert({
    where: {
      modelProviderId_name_revision: {
        modelProviderId: replicateProvider.id,
        name: 'pharmapsychotic_clip-interrogator',
        revision: '2025-01-11',
      },
    },
    update: {
      editorSchema: pharmapsychoticClipInterrogatorEditorSchema,
    },
    create: {
      modelProviderId: replicateProvider.id,
      name: 'pharmapsychotic_clip-interrogator',
      revision: '2025-01-11',
      editorSchema: pharmapsychoticClipInterrogatorEditorSchema,
    },
  });

  const anthropicProvider = await prisma.modelProvider.upsert({
    where: {
      name: 'anthropic',
    },
    update: {},
    create: {
      name: 'anthropic',
      friendlyName: 'Anthropic',
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

  const { default: claude3Haiku20240307EditorSchema } = await import(
    '../../../../noggin-server/dist/reagent-noggin-shared/editor-schemas/anthropic/claude-3-haiku-20240307.js'
  );

  const _claude3Haiku20240307 = await prisma.aIModel.upsert({
    where: {
      modelProviderId_name_revision: {
        modelProviderId: anthropicProvider.id,
        name: 'claude-3-haiku-20240307',
        revision: '2024-03-07',
      },
    },
    update: {
      editorSchema: claude3Haiku20240307EditorSchema,
    },
    create: {
      modelProviderId: anthropicProvider.id,
      name: 'claude-3-haiku-20240307',
      revision: '2024-03-07',
      editorSchema: claude3Haiku20240307EditorSchema,
    },
  });

  const { default: claude3Sonnet20240229EditorSchema } = await import(
    '../../../../noggin-server/dist/reagent-noggin-shared/editor-schemas/anthropic/claude-3-sonnet-20240229.js'
  );

  const _claude3Sonnet20240229 = await prisma.aIModel.upsert({
    where: {
      modelProviderId_name_revision: {
        modelProviderId: anthropicProvider.id,
        name: 'claude-3-sonnet-20240229',
        revision: '2024-02-29',
      },
    },
    update: {
      editorSchema: claude3Sonnet20240229EditorSchema,
    },
    create: {
      modelProviderId: anthropicProvider.id,
      name: 'claude-3-sonnet-20240229',
      revision: '2024-02-29',
      editorSchema: claude3Sonnet20240229EditorSchema,
    },
  });

  const { default: claude3Opus20240229EditorSchema } = await import(
    '../../../../noggin-server/dist/reagent-noggin-shared/editor-schemas/anthropic/claude-3-opus-20240229.js'
  );

  const _claude3Opus20240229 = await prisma.aIModel.upsert({
    where: {
      modelProviderId_name_revision: {
        modelProviderId: anthropicProvider.id,
        name: 'claude-3-opus-20240229',
        revision: '2024-02-29',
      },
    },
    update: {
      editorSchema: claude3Opus20240229EditorSchema,
    },
    create: {
      modelProviderId: anthropicProvider.id,
      name: 'claude-3-opus-20240229',
      revision: '2024-02-29',
      editorSchema: claude3Opus20240229EditorSchema,
    },
  });

  const { default: claude35Sonnet20240620EditorSchema } = await import(
    '../../../../noggin-server/dist/reagent-noggin-shared/editor-schemas/anthropic/claude-3-5-sonnet-20240620.js'
  );

  const _claude35Sonnet20240620 = await prisma.aIModel.upsert({
    where: {
      modelProviderId_name_revision: {
        modelProviderId: anthropicProvider.id,
        name: 'claude-3-5-sonnet-20240620',
        revision: '2024-06-20',
      },
    },
    update: {
      editorSchema: claude35Sonnet20240620EditorSchema,
    },
    create: {
      modelProviderId: anthropicProvider.id,
      name: 'claude-3-5-sonnet-20240620',
      revision: '2024-06-20',
      editorSchema: claude35Sonnet20240620EditorSchema,
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
