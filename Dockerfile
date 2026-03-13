# Build Stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including dev deps required for nest build)
RUN npm ci --legacy-peer-deps

COPY . .

# Generate Prisma Client 
RUN npx prisma generate

# Build the NestJS application
RUN npm run build

# Production Stage
FROM node:20-alpine AS production

WORKDIR /usr/src/app

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Only copy necessary files from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/prisma.config.* ./

# By default, use production environment
ENV NODE_ENV production

# Ensure Prisma has the right schema available inside container
RUN npx prisma generate

EXPOSE 5000

# Using npm script to trigger migrations before start if needed, 
# or start directly with node
CMD ["node", "dist/src/main.js"]
