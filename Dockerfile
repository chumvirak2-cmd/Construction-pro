FROM node:22-alpine AS deps
WORKDIR /app
ARG NEXT_PUBLIC_BASE_URL=http://localhost:3000
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=deps --chown=nextjs:nodejs /app/package*.json ./
COPY --from=deps --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=deps --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=deps --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
