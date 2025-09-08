# --- Build stage ---
FROM node:22-alpine AS build
WORKDIR /app

# Copy root manifest files for npm workspaces
COPY package.json package-lock.json* ./
# Copy web workspace manifest
COPY apps/web/package.json apps/web/package.json

# Install dependencies (including workspaces)
RUN npm ci

# Copy web source code
COPY apps/web apps/web

# Build Next.js
WORKDIR /app/apps/web
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Runtime stage ---
FROM node:22-alpine AS runtime
WORKDIR /app/apps/web
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy both root and web workspace node_modules
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/web/node_modules ./node_modules

# Copy build artifacts and required files
COPY --from=build /app/apps/web/.next ./.next
COPY --from=build /app/apps/web/public ./public
COPY --from=build /app/apps/web/package.json ./package.json

EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

# Start Next.js production server
CMD ["npm", "run", "start"]