FROM oven/bun:1 as base
WORKDIR /app

FROM base AS builder
WORKDIR /app
COPY ./packages ./packages
COPY package.json ./
RUN bun install
WORKDIR /app/packages/core
RUN bun build ./index.ts --target node --external fluent-ffmpeg --external chunk-text --outdir './build'
WORKDIR /app/packages/web
RUN bun run build

FROM --platform=$BUILDPLATFORM base AS release
ENV NODE_ENV=production
ENV DATA_DIR=/data

COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/packages/core/build/index.js .
COPY --from=builder /app/packages/web/dist dist

USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "index.js" ]
