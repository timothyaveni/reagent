import * as Y from 'yjs';
import { exportDocToJSON } from '../../noggin-server/dist/reagent-noggin-shared/ydoc-io/exportDocToJSON.js';
import { prisma } from '../db/db.js';

const noggin = await prisma.noggin.findFirst({
  where: {
    slug: process.argv[2],
  },
  select: {
    id: true,
    slug: true,
    title: true,
    aiModel: {
      select: {
        editorSchema: true,
      },
    },
  },
});

// TODO: not the best way to get the latest revision
const nogginRevision = await prisma.nogginRevision.findFirst({
  where: {
    nogginId: noggin.id,
  },
  orderBy: {
    id: 'desc',
  },
  select: {
    id: true,
    content: true,
  },
});

// console.log(noggin, nogginRevision);
const yDoc = new Y.Doc();
Y.applyUpdate(yDoc, nogginRevision.content);
console.log(exportDocToJSON(noggin.aiModel.editorSchema, yDoc));
