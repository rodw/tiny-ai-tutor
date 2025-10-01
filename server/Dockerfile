FROM node:20 AS build_deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20 AS build
WORKDIR /app
COPY --from=build_deps /app/node_modules ./node_modules
COPY tsconfig.json ./
COPY src ./src
RUN npx tsc -p tsconfig.json
COPY src/system-prompt.md ./dist/.

FROM node:20 AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --production
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]