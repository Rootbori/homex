# ---------------------------------------------------
# Stage 1: Build
# ---------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# ---------------------------------------------------
# Stage 2: Runtime
# ---------------------------------------------------
FROM node:20-alpine

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

# Set standard environment
ENV NODE_ENV=production
ENV PORT=7771

EXPOSE 7771

# Start the Next.js app
CMD ["npm", "run", "start"]
