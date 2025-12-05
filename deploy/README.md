# 🚀 Deployment Guide

This repository is set up as a **Bun Monorepo** containing a React Frontend (Client) and a Hono Backend (Server). The project is Dockerized as a single-container monolith: the React app is built and served as static assets by the Hono server.

## 🏗 Architecture Overview

- **Build Phase:** Docker builds the frontend (Vite) and backend (Hono) using Bun.
- **Runtime:** A single container runs the Hono server.
- **Routing:**
    - `/api/*` -> Handled by Hono API routes.
    - `/*` -> Handled by Hono's static middleware (serves the React SPA).

---

## 🐳 Deployment

### 1. Test deployment

Run this command from the **root** of the monorepo:

```bash
docker build -t starter-app .
```

```bash
docker run -p 3000:3000 \
  --env DATABASE_URL="postgresql://postgres:password@host.docker.internal:5445/db" \
  --env CLIENT_URL="http://localhost:3000" \
  starter-app
```

### ☁️ Deploying to Coolify

This project is pre-configured for fast deployment on [Coolify](https://coolify.io).

#### 1. Create a New Resource

1. Go to your project in Coolify.
2. Click **+ New Resource**.
3. Select your GitHub/GitLab repository (public or private) and connect it.

#### 2. Build Configuration

- **Build Pack:** `Dockerfile`
- **Docker File Location:** `/Dockerfile` (default)
- **Port:** `3000`

#### 3. Environment Variables

Go to the **Environment Variables** tab and add:

| Key            | Value                                                            | Description                                  |
| -------------- | ---------------------------------------------------------------- | -------------------------------------------- |
| `DATABASE_URL` | `postgresql://...`                                               | Use internal DB string if using Coolify's DB |
| `NODE_ENV`     | `production`                                                     | (recommended)                                |
| Other secrets  | _(as needed, e.g. `BETTER_AUTH_SECRET`,<br/>`GITHUB_CLIENT_ID`)_ | For authentication or GitHub integration     |

#### 4. Database Migrations (Important)

By default, the Docker image starts only the server. To **run migrations automatically on each deploy**:

- Go to the **Deployment Command** in Coolify's settings.
- Replace the command with:

    ```sh
    bun run db:migrate && bun src/index.ts
    ```

- Ensure that `packages/server/package.json` includes a `db:migrate` script configured to run `drizzle-kit migrate`.

> **Tip:** This setup will keep your database schema up-to-date automatically on every deployment.
