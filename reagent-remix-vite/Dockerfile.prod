FROM node:21.4.0-bookworm

WORKDIR /app

COPY package.json /app
COPY package-lock.json /app

RUN npm ci --force # we don't love --force but i think react canary ends up making us need it

COPY . /app

ENV NODE_ENV=production

RUN npx prisma generate
RUN npx prisma db push
RUN npm run build

ENTRYPOINT ["node", "server.mjs"]
