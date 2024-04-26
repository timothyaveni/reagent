#!/bin/bash

cd /app

npm install

npx prisma generate
npx prisma generate --watch &
npm run dev
