#!/bin/bash

cd /noggin-server
npm install

cd /app

# npm install at runtime so we can sync back to the host -- this is how host VS code gets access to node_modules (e.g. for prisma types)
npm install

npx prisma generate
npx prisma generate --watch &
npm run dev
