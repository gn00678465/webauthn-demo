#!/bin/bash
cd /app

bun run prisma:generate
bun run prisma:push

cd /app/apps/server/dist

bun index.mjs