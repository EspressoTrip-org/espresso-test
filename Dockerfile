FROM node:20.16 as builder
WORKDIR /app

RUN npm i -g pnpm@9

ARG GITHUB_TOKEN

RUN echo //npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN} >> ~/.npmrc && \
    echo //npm.pkg.github.com/journeyapps-platform/:_authToken=\${GITHUB_TOKEN} >> ~/.npmrc && \
    echo @journeyapps-platform:registry=https://npm.pkg.github.com/journeyapps-platform/ >> ~/.npmrc

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY service/package.json service/tsconfig.json service/
COPY packages/types/package.json packages/types/tsconfig.json packages/types/
COPY packages/utils/package.json packages/utils/tsconfig.json packages/utils/
COPY packages/catalog/package.json packages/catalog/tsconfig.json packages/catalog/

COPY packages/resolvers/entity-resolver/package.json packages/resolvers/entity-resolver/tsconfig.json packages/resolvers/entity-resolver/
COPY packages/resolvers/event-invalidator/package.json packages/resolvers/event-invalidator/tsconfig.json packages/resolvers/event-invalidator/
COPY packages/resolvers/memory-resource-db/package.json packages/resolvers/memory-resource-db/tsconfig.json packages/resolvers/memory-resource-db/
COPY packages/resolvers/mongo-resource-provider/package.json packages/resolvers/mongo-resource-provider/tsconfig.json packages/resolvers/mongo-resource-provider/
COPY packages/resolvers/http-resource-provider/package.json packages/resolvers/http-resource-provider/tsconfig.json packages/resolvers/http-resource-provider/

RUN pnpm install --frozen-lockfile

COPY service/src service/src/

COPY packages/types/src packages/types/src/
COPY packages/utils/src packages/utils/src/
COPY packages/catalog/src packages/catalog/src/
COPY packages/catalog/schema packages/catalog/schema/

COPY packages/resolvers/entity-resolver/src packages/resolvers/entity-resolver/src/
COPY packages/resolvers/event-invalidator/src packages/resolvers/event-invalidator/src/
COPY packages/resolvers/memory-resource-db/src packages/resolvers/memory-resource-db/src/
COPY packages/resolvers/mongo-resource-provider/src packages/resolvers/mongo-resource-provider/src/
COPY packages/resolvers/http-resource-provider/src packages/resolvers/http-resource-provider/src/

RUN pnpm precompile -- --verify && \
    pnpm build:service

RUN find . -name 'node_modules' -type d -prune -exec rm -rf '{}' + && \
    pnpm install --frozen-lockfile --prod --ignore-scripts

# === PROD ===

FROM node:20.16-alpine
WORKDIR /app

COPY --from=builder /app/ ./

ARG SHA
ENV SHA=${SHA}
ENV NODE_ENV=production

CMD node service/dist/index.js
