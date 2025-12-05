# ==========================================
# STAGE 1: Prerelease (Install & Build)
# ==========================================
FROM oven/bun:1 AS prerelease
WORKDIR /app

# 1. Copy package files for dependency installation
COPY package.json bun.lock tsconfig.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/
COPY packages/client/package.json ./packages/client/

# 2. Install dependencies (Frozen lockfile ensures stability)
RUN bun install --frozen-lockfile

# 3. Copy all source code and config files
COPY . .

# 4. Build the Client (React + Vite)
# Skip TypeScript check in Docker build, just run Vite
RUN cd packages/client && bunx vite build

# ==========================================
# STAGE 2: Production (Final Image)
# ==========================================
FROM oven/bun:1-slim AS production
WORKDIR /app

# 1. Copy workspace config
COPY --from=prerelease /app/package.json ./package.json
COPY --from=prerelease /app/tsconfig.json ./tsconfig.json

# 2. Copy node_modules
COPY --from=prerelease /app/node_modules ./node_modules

# 3. Copy Server Source
COPY --from=prerelease /app/packages/server ./packages/server
COPY --from=prerelease /app/packages/shared ./packages/shared

# 4. Copy the BUILT Frontend into the Server's "public" folder
COPY --from=prerelease /app/packages/client/dist ./packages/server/public

# 5. Set Environment
ENV NODE_ENV=production
ENV PORT=3000

# 6. Run the Server
WORKDIR /app/packages/server
EXPOSE 3000
CMD ["bun", "run", "start"]