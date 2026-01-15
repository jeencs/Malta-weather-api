FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

COPY dist ./dist
COPY node_modules ./node_modules
COPY docs ./docs

CMD ["node", "dist/index.js"]

