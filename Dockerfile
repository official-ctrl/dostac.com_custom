FROM node:22-alpine

RUN npm install -g pnpm@10.34.1

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY artifacts/admin/package.json artifacts/admin/
COPY artifacts/api-server/package.json artifacts/api-server/
COPY artifacts/web/package.json artifacts/web/
COPY artifacts/mockup-sandbox/package.json artifacts/mockup-sandbox/
COPY lib/api-client-react/package.json lib/api-client-react/
COPY lib/api-spec/package.json lib/api-spec/
COPY lib/api-zod/package.json lib/api-zod/
COPY lib/db/package.json lib/db/
COPY scripts/package.json scripts/

RUN pnpm install --no-frozen-lockfile

COPY . .

RUN pnpm --filter '!@workspace/mockup-sandbox' -r --if-present run build

EXPOSE 3000

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
