import { PrismaClient } from '@prisma/client';
import { createRequire } from 'node:module';
import * as Y from 'yjs';

import { importDocFromObject } from '../../../../../noggin-server/dist/reagent-noggin-shared/ydoc-io/importDocFromJSON.js';

const require = createRequire(import.meta.url);
const prisma = new PrismaClient();

async function createNogginWithRevision({
  yDocObject,
  title,
  slug,
  modelProviderName,
  modelName,
  modelRevision,
}) {
  console.log(`Seeding ${title}`);

  const modelProvider = await prisma.modelProvider.findUnique({
    where: {
      name: modelProviderName,
    },
  });

  const aiModel = await prisma.aIModel.findUnique({
    where: {
      modelProviderId_name_revision: {
        name: modelName,
        modelProviderId: modelProvider.id,
        revision: modelRevision,
      },
    },
    select: {
      id: true,
      editorSchema: true,
    },
  });

  const yDoc = importDocFromObject(aiModel.editorSchema, yDocObject);
  const serializedYDoc = Buffer.from(Y.encodeStateAsUpdate(yDoc));

  const nogginData = {
    title,
    slug,
    aiModelId: aiModel.id,
    nogginRevisions: {
      create: {
        content: serializedYDoc,
      },
    },
    userOwnerId: 1,
  };

  return await prisma.noggin.upsert({
    where: {
      slug,
    },
    update: nogginData,
    create: nogginData,
  });
}

async function main() {
  // https://github.com/andreasonny83/unique-names-generator/tree/main/src/dictionaries

  await createNogginWithRevision({
    yDocObject: (await import('./hex-color-converter.ydoc.js')).default,
    title: 'Hex Color Converter',
    slug: 'heavy-crocodile-0123',
    modelProviderName: 'openai',
    modelName: 'gpt-4-1106-preview',
    modelRevision: '2023-12-22',
  });

  await createNogginWithRevision({
    yDocObject: (await import('./todo-list-classifier.ydoc.js')).default,
    title: 'Todo List Classifier',
    slug: 'total-cat-0123',
    modelProviderName: 'openai',
    modelName: 'gpt-4-1106-preview',
    modelRevision: '2023-12-22',
  });

  await createNogginWithRevision({
    yDocObject: (await import('./joke-teller.ydoc.js')).default,
    title: 'Joke Teller',
    slug: 'joint-tiger-0123',
    modelProviderName: 'openai',
    modelName: 'gpt-4-1106-preview',
    modelRevision: '2023-12-22',
  });

  await createNogginWithRevision({
    yDocObject: (await import('./tree-lights.ydoc.js')).default,
    title: 'Tree Lights',
    slug: 'tremendous-lion-0123',
    modelProviderName: 'openai',
    modelName: 'gpt-4-vision-preview',
    modelRevision: '2023-12-23',
  });

  await createNogginWithRevision({
    yDocObject: (await import('./bananagrams-checker.ydoc.js')).default,
    title: 'Bananagrams Checker',
    slug: 'balanced-cheetah-0123',
    modelProviderName: 'openai',
    modelName: 'gpt-4-vision-preview',
    modelRevision: '2023-12-23',
  });

  await createNogginWithRevision({
    yDocObject: (await import('./cat-detector.ydoc.js')).default,
    title: 'Cat Detector',
    slug: 'capitalist-donkey-0123',
    modelProviderName: 'openai',
    modelName: 'gpt-4-vision-preview',
    modelRevision: '2023-12-23',
  });

  await createNogginWithRevision({
    yDocObject: (await import('./nutrition-label-reader.ydoc.js')).default,
    title: 'Nutrition fact label reader',
    slug: 'narrow-fox-0123',
    modelProviderName: 'openai',
    modelName: 'gpt-4-vision-preview',
    modelRevision: '2023-12-23',
  });

  await createNogginWithRevision({
    yDocObject: (
      await import('./attractive-man-drawing-generator.ydoc.js')
    ).default,
    title: 'Attractive man drawing generator',
    slug: 'adorable-mammal-0123',
    modelProviderName: 'replicate',
    modelName: 'sdxl',
    modelRevision:
      '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b_2023-12-23',
  });
}

export default main;
