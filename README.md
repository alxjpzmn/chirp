# Chirp

Convert the text content of URLs into a podcast feed, each article becoming an episode read by [OpenAI's TTS API](https://platform.openai.com/docs/guides/text-to-speech).

🚧 Chirp is in early beta state – it works, but expect quite a few rough edges.

<img alt="Screenshot of Chirp" src="./.github/chirp-screenshot.png" style="width: 100%" />

## Getting Started

You'll need an OpenAI API key: https://platform.openai.com/api-keys. I also recommend to set a monthly budget: https://platform.openai.com/account/limits.

### Quick Start

To give Chirp a quick spin, use:

```
docker run -d \
  --name chirp \
  -v /home/your-chirp-data:/data \
  -e OPENAI_API_KEY=your-openai-api-key \
  -p 3000:3000 \
  ghcr.io/alxjpzmn/chirp:latest`
```

### Setup

For a more persistent setup of Chirp, it's best to have a Redis instance running separately, e.g. through their official [Docker image](https://hub.docker.com/_/redis/). If you do so, don't forget to set the two Redis-related environment variables (more on environment variables below).

You can configure the following environment variables (if you run Chirp via `bun run dev`, just create a `.env` file inside the `packages/core` directory and add them there):

| Name              | Effect                                                                                                                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OPENAI_API_KEY    | Mandatory, authenticates you against OpenAI's TTS API                                                                                                                                    |
| PASSWORD          | Optional, adds basic authentication using JWTs for your instance. Beware that your feed itself and its data are always public since podcast players don't play well with authentication. |
| MAX_ARTICLE_CHARS | Optional, this is useful for development if you want to test things and don't want to rack up bills with OpenAI. I use 200 in development.                                               |
| SSL               | Optional, in case you have Chirp served via HTTPS you will need to set this to true or the feed won't work. Defaults to false.                                                           |
| PORT              | Optional, defaults to `3000`.                                                                                                                                                            |
| DATA_DIR          | Optional, defaults to the directory Chirp is being executed from.                                                                                                                        |
| REDIS_HOST        | Optional, defaults to `localhost`. If not specified, a Redis instance will be spun up inside the Chirp container.                                                                        |
| REDIS_PORT        | Optional, defaults to `6379`.                                                                                                                                                            |

### Notes

- Beware that Overcast and Castro seem to expect a publicly available podcast feed. Apple Podcasts and direct RSS also work within a e.g. a VPN network.
- Getting the TTS file (and merging it via FFmpeg ) takes some time. For longer texts, expect a couple of minutes. I'll be adding more verbose progress indicators.
- If you set a server password, this will currently only put the `/api` REST endpoints behind a JWT validation. The podcast feed and its required files (e.g. the feed cover) plus the websocket endpoints won't be requiring a valid token.

## Developer Guide

- PRs are more than welcome! If you'd like to make improvements to the code, add a new feature, fix a bug etc., feel free to just work on a separate branch and open a PR, I'll review merge to `main` asap.
- To contribute, you'll need the Bun runtime: https://bun.sh.
- Chirp is organized as a monorepo, with a web client using React with Vite and the core (backend) using Bun. There's a shared package to share types and utility functions between the two.
- In case you've never spun up Redis before, but pulled the Docker image already, you can run `bun run redis` inside the main directory.
- To spin up both the Vite development server and the Bun backend, just run `bun run dev` inside the main directory.

## Acknowledgements

Chirp depends on a lot of other projects. Here's an (incomplete) list of them:

- [OpenAI TTS API](https://platform.openai.com/docs/guides/text-to-speech): I've tried other TTS APIs, but this one has the best quality so far in my view.
- [Bun](https://bun.sh): hyped for a reason, it really is that fast, well documented and convenient to use
- [Elysia](https://elysiajs.com): effortless APIs with Bun
- [Chakra UI](https://chakra-ui.com): It's ridiculously simple to hack together a decent looking web app with it
- [Phosphor Icons](https://phosphoricons.com): some of the most beautiful and versatile icons around
- [Readability](https://github.com/mozilla/readability): extracts the text content of an URL, this is what Firefox uses for its reader view and the folks at the Mozilla foundation were kind enough to pack it into a Node lib, too
- [FFmpeg](https://ffmpeg.org): https://www.youtube.com/watch?v=9kaIXkImCAM
