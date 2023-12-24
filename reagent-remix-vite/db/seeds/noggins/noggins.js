import { PrismaClient } from '@prisma/client';
import { createRequire } from 'node:module';

import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
const prisma = new PrismaClient();

async function createNogginWithRevision({
  filename,
  title,
  slug,
  modelProviderName,
  modelName,
  modelRevision,
}) {
  // const base64Content = fs.readFileSync(
  //   path.join(new URL(import.meta.url).pathname, '..', filename),
  // );
  const buffer = fs.readFileSync(
    path.join(new URL(import.meta.url).pathname, '..', filename),
  );
  
  // const buffer = Buffer.from(hexContent, 'hex');
  // console.log(slug, base64Content.toString());
  // const buffer = Buffer.from(base64Content, 'base64');
  // const buffer = Buffer.from(atob(base64Content.toString()));
  // console.log(buffer);

  const modelProvider = await prisma.modelProvider.findUnique({
    where: {
      name: modelProviderName,
    },
  });

  const nogginData = {
    title,
    slug,
    aiModel: {
      connect: {
        modelProviderId_name_revision: {
          name: modelName,
          modelProviderId: modelProvider.id,
          revision: modelRevision,
        },
      },
    },
    nogginRevisions: {
      create: {
        content: buffer,
      },
    },
    userOwner: {
      connect: {
        id: 1,
      },
    },
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
  await createNogginWithRevision({
    filename: './icon-generator.ydoc',
    title: 'Icon Generator',
    slug: 'icon-generator-0123',
    modelProviderName: 'replicate',
    modelName: 'sdxl',
    modelRevision:
      '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b_2023-12-23',
  });

  await createNogginWithRevision({
    filename: './hex-color-converter.ydoc',
    title: 'Hex Color Converter',
    slug: 'hex-converter-0123',
    modelProviderName: 'openai',
    modelName: 'gpt-4-1106-preview',
    modelRevision: '2023-12-22',
  });

  await createNogginWithRevision({
    filename: './todo-list-classifier.ydoc',
    title: 'Todo List Classifier',
    slug: 'todo-classifier-0123',
    modelProviderName: 'openai',
    modelName: 'gpt-4-1106-preview',
    modelRevision: '2023-12-22',
  });

  await createNogginWithRevision({
    filename: './joke-teller.ydoc',
    title: 'Joke Teller',
    slug: 'joke-teller-0123',
    modelProviderName: 'openai',
    modelName: 'gpt-4-1106-preview',
    modelRevision: '2023-12-22',
  });

  await createNogginWithRevision({
    filename: './tree-lights.ydoc',
    title: 'Tree Lights',
    slug: 'tree-lights-0123',
    modelProviderName: 'openai',
    modelName: 'gpt-4-vision-preview',
    modelRevision: '2023-12-23',
  });

  await createNogginWithRevision({
    filename: './bananagrams-checker.ydoc',
    title: 'Bananagrams Checker',
    slug: 'bananagrams-checker-0123',
    modelProviderName: 'openai',
    modelName: 'gpt-4-vision-preview',
    modelRevision: '2023-12-23',
  });

  await createNogginWithRevision({
    filename: './cat-detector.ydoc',
    title: 'Cat Detector',
    slug: 'cat-detector-0123',
    modelProviderName: 'openai',
    modelName: 'gpt-4-vision-preview',
    modelRevision: '2023-12-23',
  });
}

export default main;
