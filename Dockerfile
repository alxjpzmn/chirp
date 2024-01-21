FROM --platform=$BUILDPLATFORM oven/bun:latest as base

FROM --platform=$BUILDPLATFORM base AS builder
WORKDIR /app
COPY ./packages ./packages
COPY package.json ./
RUN bun install
WORKDIR /app/packages/core
RUN bun build ./index.ts --target node --external fluent-ffmpeg --external chunk-text --outdir './build'
WORKDIR /app/packages/web
RUN echo "Building base image for platform $BUILDPLATFORM"
RUN bun run build

FROM --platform=$TARGETPLATFORM base AS release
LABEL org.opencontainers.image.source=https://github.com/alxjpzmn/chirp
LABEL org.opencontainers.image.description "Convert the text content of URLs into a podcast feed, each article becoming an episode read by OpenAI's TTS API"
LABEL org.opencontainers.image.licenses=MIT

RUN echo "Setting up release image for platform $TARGETPLATFORM"

ENV NODE_ENV=production
ENV DATA_DIR=/data
RUN apt-get update && apt-get install -y redis-server


COPY startup.sh /app/startup.sh
RUN chmod +x /app/startup.sh

COPY --from=builder /app/packages/core/assets/cover.jpg assets/
COPY --from=builder /app/packages/core/build/index.js .
COPY --from=builder /app/packages/web/dist dist
COPY --from=mwader/static-ffmpeg:6.1.1 /ffprobe /usr/local/bin/
COPY --from=mwader/static-ffmpeg:6.1.1 /ffmpeg /usr/local/bin/

USER bun
EXPOSE 3000/tcp
ENTRYPOINT ["/app/startup.sh"]
