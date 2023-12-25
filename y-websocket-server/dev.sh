#!/bin/bash

cd /app

npm install --force

npx prisma generate
npx prisma generate --watch &
npm run dev
