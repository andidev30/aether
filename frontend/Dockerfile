FROM node:20-alpine AS build

WORKDIR /app

ENV VITE_BACKEND_URL=https://aether-backend-1079341308711.us-central1.run.app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig*.json vite.config.ts index.html ./
COPY src ./src

RUN npm run build

FROM nginx:1.27-alpine AS runner

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
