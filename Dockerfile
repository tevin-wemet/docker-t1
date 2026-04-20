# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS build
WORKDIR /app

RUN apk add --no-cache python3 make g++ sqlite

COPY package.json ./
RUN npm install --omit=dev

COPY src ./src
COPY scripts ./scripts
COPY public ./public

FROM node:20-alpine AS runtime
WORKDIR /app

RUN apk add --no-cache tini && \
    addgroup -S app && adduser -S app -G app && \
    mkdir -p /app/data && chown -R app:app /app

COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/src ./src
COPY --from=build --chown=app:app /app/scripts ./scripts
COPY --from=build --chown=app:app /app/public ./public
COPY --chown=app:app package.json ./

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    DATA_DIR=/app/data

USER app
EXPOSE 3000
VOLUME ["/app/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --spider -q http://127.0.0.1:3000/healthz || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "src/app.js"]
