# STAGE 1: Build frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# STAGE 2: Runtime
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY api ./api
COPY public ./public
RUN npm install -g vercel@latest
EXPOSE 3000
CMD ["vercel", "dev", "--listen", "3000", "--yes"]