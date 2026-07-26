FROM node:24-bookworm-slim

ENV NODE_ENV=production
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

COPY tsconfig.json next-env.d.ts ./
COPY scripts/video-render-worker.ts ./scripts/video-render-worker.ts
COPY src/lib/video/worker-agent.ts ./src/lib/video/worker-agent.ts

RUN mkdir -p /app/.gem-video-worker && chown -R node:node /app
USER node

CMD ["pnpm", "video:worker"]
