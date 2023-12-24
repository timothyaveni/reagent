#!/bin/bash

cd /app

npx prisma generate
npx prisma generate --watch &
npm run dev