import fs from 'fs';
import http from 'http';
import jwt from 'jsonwebtoken';
import { StringDecoder } from 'string_decoder';
import { debounce } from 'underscore';
import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import YWebsocketUtils from './utils.js';

import { PrismaClient } from '@prisma/client';

import dotenv from 'dotenv';
dotenv.config();

const { TokenExpiredError } = jwt;

const { setupWSConnection, setPersistence } = YWebsocketUtils;

// eh for now we'll just sync this type between projects
// TODO: awareness info should be authenticated
type JWTPayload = {
  nogginId: number;
  userId: number;
};

const wss = new WebSocketServer({ noServer: true });

// const host = process.env.Y_WEBSOCKET_HOST;
// const portStr = process.env.Y_WEBSOCKET_PORT;

/*if (!host || !portStr) {
  throw new Error(
    'Y_WEBSOCKET_HOST and Y_WEBSOCKET_PORT must be set in .env (see .env.example)',
  );
}*/

// const port = parseInt(portStr, 10);

const port = 2347;
const host = '0.0.0.0';

const jwtPublicKey = fs.readFileSync(
  './jwt/y-websocket-es512-public.pem',
  'utf8',
);

const log = (...args: any[]) => {};

const server = http.createServer((request, response) => {
  // console.log('request', request);
  if (request.method === 'POST' && request.url === '/immediate-sync') {
    log('immediate-sync');
    // Check for the correct Authorization header
    const authHeader = request.headers['authorization'] || '';
    const token = authHeader.split(' ')[1]; // Get the token part of the header

    // thanks gpt
    if (token === process.env.SHARED_Y_WEBSOCKET_SERVER_SECRET) {
      log('token matches');
      // Parse the request body to get the nogginId
      let body = '';
      const decoder = new StringDecoder('utf-8');
      request.on('data', (chunk) => {
        body += decoder.write(chunk);
      });

      request.on('end', () => {
        body += decoder.end();

        try {
          log('body', body);
          const parsedBody = JSON.parse(body);
          const nogginId = parsedBody.nogginId;

          if (nogginId) {
            log('nogginId', nogginId);
            const updateFunc = updateDocFunction[nogginId];

            if (!updateFunc) {
              log('no updateFunc');
              response.writeHead(200, { 'Content-Type': 'text/plain' });
              response.end('already up to date');
              return;
            }

            updateDocFunction[nogginId]()
              .then(() => {
                log('synced noggin');
                // When the function finishes, respond to the request
                response.writeHead(200, { 'Content-Type': 'text/plain' });
                response.end('');
              })
              .catch((error) => {
                console.error(error);
                // Handle errors from the async function
                response.writeHead(500, { 'Content-Type': 'text/plain' });
                response.end('Error syncing noggin');
              });
          } else {
            log('no nogginId');
            // nogginId not found in the body
            response.writeHead(400, { 'Content-Type': 'text/plain' });
            response.end('Missing nogginId parameter');
          }
        } catch (error) {
          console.error(error);
          // JSON parsing error
          response.writeHead(400, { 'Content-Type': 'text/plain' });
          response.end('Invalid JSON body');
        }
      });
    } else {
      log('token does not match');
      // Invalid or missing Authorization header
      response.writeHead(401, { 'Content-Type': 'text/plain' });
      response.end('Unauthorized');
    }
    return;
  }

  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('okay');
});

const prisma = new PrismaClient();

const serializeYDoc = (ydoc: Y.Doc) => {
  const buffer = Buffer.from(Y.encodeStateAsUpdate(ydoc));
  return buffer;
};

const deserializeYDoc = (serialized: Buffer, ydoc: Y.Doc) => {
  const uint8Array = new Uint8Array(serialized);
  Y.applyUpdate(ydoc, uint8Array);
  return ydoc;
};

const getNogginVariablesFromYdoc = (ydoc: Y.Doc): /*NogginVariables*/ any => {
  const variableNamesByDocument = ydoc
    .get('documentParameterIdsByDocument', Y.Map)
    .toJSON();

  const allVariables = ydoc.get('documentParameters', Y.Map).toJSON();

  const usedVariables = {};

  for (const documentId of Object.keys(variableNamesByDocument)) {
    const variableIds = variableNamesByDocument[documentId];
    for (const variableId of variableIds) {
      usedVariables[variableId] = allVariables[variableId];
    }
  }

  log('getNogginVariablesFromYdoc', usedVariables);

  // TODO: include override variables

  return usedVariables;
};

// TODO: need to use the shared types here
const getOutputFormatFromYdoc = async (
  nogginId: number,
  ydoc: Y.Doc,
): /*NogginRevisionOutputSchema*/ Promise<any> => {
  const { chosenOutputFormatKey } = ydoc.get('nogginOptions', Y.Map).toJSON();
  const editorSchema: /*EditorSchema*/ any = (
    await prisma.noggin.findUnique({
      where: {
        id: nogginId,
      },
      select: {
        aiModel: {
          select: {
            editorSchema: true,
          },
        },
      },
    })
  ).aiModel.editorSchema;

  // TODO make sure this doesn't throw lol
  const outputFormat = editorSchema.outputFormats.find(
    (o) => o.key === chosenOutputFormatKey,
  );
  const outputFormatType = outputFormat.type;

  return {
    outputFormatType,
    components: Object.fromEntries(
      outputFormat.editorComponents.map((componentKey: string) => {
        // hm it feels like i shouldn't have to jsonify this entire object... i thought the sub-objects were maps? ig not...
        const component = ydoc.get('modelInputs', Y.Map).toJSON()[componentKey];
        return [componentKey, component];
      }),
    ),
  };
};

// todo memory leaks...
const docLoaded = {};
const updateDocFunction = {};
const docEditors: {
  [docName: string]: {
    userId: number;
    lastEditTs: number;
  }[];
} = {};

const trackDocEditor = (docName: string, userId: number) => {
  if (!docEditors[docName]) {
    docEditors[docName] = [];
  }

  const existingIndex = docEditors[docName].findIndex(
    (editor) => editor.userId === userId,
  );

  if (existingIndex !== -1) {
    docEditors[docName].splice(existingIndex, 1);
  }

  docEditors[docName].push({
    userId,
    lastEditTs: Date.now(),
  });

  log(docEditors); // this line took gigabytes of disk space :))
};

const EDIT_THRESHOLD = 1000 * 60; // 1 minute

const getAndRefreshDocEditors = (docName: string) => {
  if (!docEditors[docName]) {
    return [];
  }

  const now = Date.now();

  docEditors[docName] = docEditors[docName].filter(
    (editor) => now - editor.lastEditTs < EDIT_THRESHOLD,
  );

  return docEditors[docName];
};

setPersistence({
  provider: prisma, // i don't think this does anyhting
  bindState: async (docName, ydoc) => {
    try {
      docLoaded[docName] = false;
      log('bindState', docName);
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
      updateDocFunction[docName] = async (update) => {
        log('update');
        const serialized = serializeYDoc(ydoc);
        log({ serialized });
        const vars = getNogginVariablesFromYdoc(ydoc);
        const nogginId = parseInt(docName, 10);
        const outputSchema = await getOutputFormatFromYdoc(nogginId, ydoc);
        // todo: create new revision only conditionally -- >5minutes or lots of change or if the row has been used by a noggin run -- otherwise just update the highest-ID row (this will require db txns...)
        await prisma.nogginRevision.create({
          data: {
            noggin: {
              connect: {
                id: nogginId,
              },
            },
            content: serialized,
            nogginVariables: vars,
            outputSchema: outputSchema,
            editors: {
              connect: getAndRefreshDocEditors(docName).map((editor) => ({
                id: editor.userId,
              })),
            },
          },
        });
      };

      ydoc.on('update', debounce(updateDocFunction[docName], 5000));
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
      log('writeState', docName);

      // here we probably always want to make a new revision, but idk, maybe not
      // TODO: dry it out
      const serialized = serializeYDoc(ydoc);
      const vars = getNogginVariablesFromYdoc(ydoc);
      const nogginId = parseInt(docName, 10);
      const outputSchema = await getOutputFormatFromYdoc(nogginId, ydoc);
      await prisma.nogginRevision.create({
        data: {
          noggin: {
            connect: {
              id: nogginId,
            },
          },
          content: serialized,
          nogginVariables: vars,
          outputSchema: outputSchema,
          editors: {
            connect: getAndRefreshDocEditors(docName).map((editor) => ({
              id: editor.userId,
            })),
          },
        },
      });
    } catch (e) {
      console.error(e);
      console.trace();
    }
  },
});

wss.on('connection', function (conn, req) {
  // stolen from yjs ws code ... yikers
  const docName = req.url.slice(1).split('?')[0];
  conn.on('message', (m) => {
    const userId = socketToUserId.get(conn);
    if (userId !== undefined) {
      // can happen during initial deploy
      trackDocEditor(docName, userId);
    }
  });

  setupWSConnection(...arguments);
});

const socketToUserId = new WeakMap();

// TODO: any errors here will crash the server (like if the deserialize breaks)
server.on('upgrade', async (request, socket, head) => {
  log('upgrade');

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

  log('decoded', decoded);

  const { nogginId, userId } = decoded as JWTPayload;

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
    socketToUserId.set(ws, userId);
    wss.emit('connection', ws, request);
  });
});

server.listen(port, host, () => {
  console.log(`running at '${host}' on port ${port}`);
});
