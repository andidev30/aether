FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies using package-lock for deterministic builds
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS build

COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runner

ENV NODE_ENV=production
WORKDIR /app

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 3001
CMD ["node", "dist/main.js"]
