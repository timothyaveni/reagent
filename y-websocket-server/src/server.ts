import { WebSocket, WebSocketServer } from 'ws';
import http from 'http';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import YWebsocketUtils from './utils.js';
import * as Y from 'yjs';
import { debounce } from 'underscore';

import { PrismaClient } from '@prisma/client';

import dotenv from 'dotenv';
dotenv.config();

const { TokenExpiredError } = jwt;

const { setupWSConnection, setPersistence } = YWebsocketUtils;

// eh for now we'll just sync this type between projects
// TODO: awareness info should be authenticated
type JWTPayload = {
  nogginId: number;
};

const wss = new WebSocketServer({ noServer: true });

const host = process.env.Y_WEBSOCKET_HOST;
const portStr = process.env.Y_WEBSOCKET_PORT;

if (!host || !portStr) {
  throw new Error(
    'Y_WEBSOCKET_HOST and Y_WEBSOCKET_PORT must be set in .env (see .env.example)',
  );
}

const port = parseInt(portStr, 10);

const jwtPublicKey = fs.readFileSync(
  './jwt/y-websocket-es512-public.pem',
  'utf8',
);

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('okay');
});

const prisma = new PrismaClient();

const serializeYDoc = (ydoc: Y.Doc) => {
  console.log('serialize', ydoc.toJSON());
  const buffer = Buffer.from(Y.encodeStateAsUpdate(ydoc));
  return buffer;
};

const deserializeYDoc = (serialized: Buffer, ydoc: Y.Doc) => {
  const uint8Array = new Uint8Array(serialized);
  Y.applyUpdate(ydoc, uint8Array);
  console.log('deserialize', ydoc.toJSON())
  return ydoc;
};

const docLoaded = {};

setPersistence({
  provider: prisma, // i don't think this does anyhting
  bindState: async (docName, ydoc) => {
    try {
      docLoaded[docName] = false;
      console.log('bindState', docName);
      console.log(
        'blargh',
        await prisma.nogginRevision.findFirst({
          where: {
            nogginId: parseInt(docName, 10),
          },
          orderBy: {
            id: 'desc', // this feels a little risky relative to doing it by updatedAt but we're only supposed to update the most recent one
          },
          select: {
            content: true,
          },
        }),
      );
      const { content } = await prisma.nogginRevision.findFirst({
        where: {
          nogginId: parseInt(docName, 10),
        },
        orderBy: {
          id: 'desc', // this feels a little risky relative to doing it by updatedAt but we're only supposed to update the most recent one
        },
        select: {
          content: true,
        },
      });

      if (content) {
        // console.log('deserializing', content);
        deserializeYDoc(content, ydoc);
      }

      docLoaded[docName] = true;

      ydoc.on(
        'update',
        debounce(async (update) => {
          console.log('update');
          const serialized = serializeYDoc(ydoc);
          // todo: create new revision only conditionally -- >5minutes or lots of change or if the row has been used by a noggin run -- otherwise just update the highest-ID row (this will require db txns...)
          await prisma.nogginRevision.create({
            data: {
              nogginId: parseInt(docName, 10),
              content: serialized,
            },
          });
        }, 5000),
      );
    } catch (e) {
      console.error(e);
      console.trace();
    }
  },
  writeState: async (docName, ydoc) => {
    if (!docLoaded[docName]) {
      // not if they closed it real fast! the above bindState doesn't have this problem because it only binds after the load, but this is a loophole
      return;
    }

    try {
      console.log('writeState', docName);

      // here we probably always want to make a new revision, but idk, maybe not
      const serialized = serializeYDoc(ydoc);
      await prisma.nogginRevision.create({
        data: {
          nogginId: parseInt(docName, 10),
          content: serialized,
        },
      });
    } catch (e) {
      console.error(e);
      console.trace();
    }
  },
});

wss.on('connection', setupWSConnection);

// TODO: any errors here will crash the server (like if the deserialize breaks)
server.on('upgrade', async (request, socket, head) => {
  console.log('upgrade');

  let decoded: JWTPayload;
  try {
    decoded = await new Promise((resolve, reject) => {
      const token = new URL(request.url, 'http://localhost').searchParams.get(
        'authToken',
      );

      if (!token) {
        reject(new Error('No token'));
      }
      jwt.verify(
        token,
        jwtPublicKey,
        {
          algorithms: ['ES512'],
        },
        (err: any, decoded: JWTPayload) => {
          if (err) {
            reject(err);
          }
          resolve(decoded);
        },
      );
    });
  } catch (e) {
    if (e instanceof TokenExpiredError) {
      // maybe
      // ws.close();
      console.error('Token expired');
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n'); // TODO not actually sure this does what it looks like -- we'll come back to this
      socket.destroy();
      return;
    } else {
      throw e; // todo probably still catch
    }
  }

  console.log('decoded', decoded);

  const { nogginId } = decoded as JWTPayload;

  // from utils.cjs. really we already know the room ID but i don't want to figure out how to pass it into the setup handler
  const requestedNogginId = parseInt(request.url.slice(1).split('?')[0], 10);

  if (requestedNogginId !== nogginId) {
    // throw new Error(`Room ID mismatch: ${requestedNogginId} !== ${nogginId}`);
    console.error(`Room ID mismatch: ${requestedNogginId} !== ${nogginId}`);
    // ws.close();
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n'); // also TODO
    socket.destroy();
    return;
  }

  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

server.listen(port, host, () => {
  console.log(`running at '${host}' on port ${port}`);
});
