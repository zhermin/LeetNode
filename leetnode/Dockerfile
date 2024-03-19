# syntax=docker/dockerfile:1.4

FROM node:18-alpine3.18 AS base
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY --link package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
COPY --link /src/packages/mantine-rte /app/src/packages/mantine-rte
COPY --link /prisma /app/prisma
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm@7.23.0 && pnpm i --prod --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps --link /app/node_modules ./node_modules
COPY --link . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED 1

RUN \
  addgroup --system --gid 1001 nodejs; \
  adduser --system --uid 1001 nextjs

COPY --from=builder --link /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --link --chown=1001:1001 /app/.next/standalone ./
COPY --from=builder --link --chown=1001:1001 /app/.next/static ./.next/static

USER nextjs

CMD ["node", "server.js"]