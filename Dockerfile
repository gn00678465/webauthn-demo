FROM oven/bun:1-slim AS base

ENV WORKDIR=/app
WORKDIR $WORKDIR

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

FROM base AS builder

COPY --link . .

RUN bun install --frozen-lockfile
RUN bun run build

FROM base

ENV NODE_ENV=production

COPY --from=builder /app /app
COPY --from=builder /app/apps/client/dist /app/apps/server/dist/public

RUN rm -rf /app/apps/client

EXPOSE 80
EXPOSE 443

CMD ["/bin/bash", "./scripts/migrate-and-start.sh"]