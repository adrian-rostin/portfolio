# syntax=docker/dockerfile:1

# --- Build: Angular-App statisch vorrendern ---------------------------------
FROM node:22.23.3-alpine AS build
WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# --- Runtime: nur statische Dateien, nginx ohne Root-Rechte -------------------
FROM nginxinc/nginx-unprivileged:1.31.5-alpine AS runtime

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist/portfolio/browser /usr/share/nginx/html

EXPOSE 8080
USER 101
