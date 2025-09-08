# --- Build stage ---
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/web/package.json apps/web/package.json

RUN npm ci

COPY apps/backend/tsconfig.json apps/backend/tsconfig.json
COPY apps/backend apps/backend

WORKDIR /app/apps/backend
RUN npm run build

# --- Runtime stage ---
FROM node:22-alpine AS runtime
WORKDIR /app/apps/backend
# Install curl for healthcheck
RUN apk add --no-cache curl

ENV NODE_ENV=production

COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/backend/dist dist
COPY --from=build /app/apps/backend/package.json package.json

EXPOSE 3000
CMD ["node", "dist/server.js"]