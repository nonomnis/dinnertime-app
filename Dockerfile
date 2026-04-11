# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Install OpenSSL (needed for Prisma to detect correct binary target)
RUN apk add --no-cache openssl

# Copy package files and prisma schema (needed for postinstall)
COPY package.json ./
COPY prisma ./prisma/

# Install dependencies (postinstall runs prisma generate)
RUN npm install

# Copy remaining application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine
WORKDIR /app

# Accept build args from DigitalOcean App Platform
ARG DATABASE_URL
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET

# Persist as runtime env vars
ENV NODE_ENV=production
ENV DATABASE_URL=$DATABASE_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET

RUN apk add --no-cache dumb-init openssl

# Copy built application from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Copy modules AFTER standalone (standalone overwrites node_modules)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/@auth ./node_modules/@auth
COPY --from=builder /app/node_modules/next-auth ./node_modules/next-auth

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

EXPOSE 3000
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

  ENTRYPOINT ["dumb-init", "--"]
  CMD ["node", "server.js"]
