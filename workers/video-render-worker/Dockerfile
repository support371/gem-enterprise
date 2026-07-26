FROM node:24-bookworm-slim

ENV NODE_ENV=production
WORKDIR /opt/gem-video-render-worker

RUN useradd --create-home --uid 10001 gemworker

COPY workers/video-render-worker/lib.mjs ./lib.mjs
COPY workers/video-render-worker/worker.mjs ./worker.mjs

USER gemworker
EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.VIDEO_WORKER_HEALTH_PORT||8787)+'/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "worker.mjs"]
