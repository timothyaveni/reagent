import { PrismaClient } from '@prisma/client';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
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

  const gpt41106PreviewEditorSchema = require('./openai_gpt41106PreviewEditorSchema.json');

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

  const gpt35Turbo1106EditorSchema = require('./openai_gpt35Turbo1106EditorSchema.json');

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

  const gpt4VisionPreviewEditorSchema = require('./openai_gpt4VisionPreviewEditorSchema.json');

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

  const sdxlEditorSchema = require('./replicate_sdxlEditorSchema.json');

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

  const fofr_sdxlEmojiEditorSchema = require('./replicate_fofr_sdxlEmojiEditorSchema.json');

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

  const unlimitedBreadsticksEditorSchema = require('./test_unlimitedBreadsticksEditorSchema.json');

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
}

export default main;
