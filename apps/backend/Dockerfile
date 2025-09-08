# --- Build stage ---
FROM node:22-alpine AS build
WORKDIR /app

# Root manifests for npm workspaces
COPY package.json package-lock.json* .npmrc* ./

# Workspace manifests (so npm can resolve workspaces properly)
COPY apps/backend/package.json apps/backend/package.json
COPY apps/web/package.json apps/web/package.json

# Install all deps (incl. dev) for building
RUN npm ci

# Copy only backend sources required for TypeScript build
COPY apps/backend/tsconfig.json apps/backend/tsconfig.json
COPY apps/backend/src apps/backend/src

# Build backend -> emits to apps/backend/dist
WORKDIR /app/apps/backend
RUN npm run build

# Optional: slim dependencies for runtime (remove dev deps)
# This affects the root node_modules in this stage only
WORKDIR /app
RUN npm prune --omit=dev

# --- Runtime stage ---
FROM node:22-alpine AS runtime
WORKDIR /app/apps/backend
ENV NODE_ENV=production

# Install curl for healthchecks (tiny)
RUN apk add --no-cache curl

# Use a non-root user for better security
USER node

# Copy production dependencies from build stage
# Root node_modules (contains workspace-resolved deps)
COPY --chown=node:node --from=build /app/node_modules /app/node_modules
# (Optional) if your workspace created a local node_modules:
# COPY --chown=node:node --from=build /app/apps/backend/node_modules ./node_modules

# Copy build artifacts and package.json
COPY --chown=node:node --from=build /app/apps/backend/dist ./dist
COPY --chown=node:node --from=build /app/apps/backend/package.json ./package.json

# Optional: better stack traces in prod
ENV NODE_OPTIONS=--enable-source-maps

EXPOSE 3000

# Built-in container health probe
HEALTHCHECK --interval=20s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -fsS http://localhost:3000/healthz || exit 1

CMD ["node", "dist/server.js"]