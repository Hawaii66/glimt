# Glimt v2

pnpm monorepo with Convex backend and Expo mobile app.

## Structure

```text
glimt-v2/
├── convex/     # Convex functions (CLI runs from repo root)
├── expo/       # Expo app (glimt-expo workspace package)
├── packages/   # Shared workspace packages (empty for now)
└── glimt.sh    # Environment-aware dev orchestrator
```

## Prerequisites

- Node.js 22+
- pnpm 10.12.4 (`corepack enable && corepack prepare pnpm@10.12.4 --activate`)

## Install

```bash
pnpm install
```

## First-time Convex setup

1. Copy the env template and create a dev env file:

   ```bash
   cp .env.example .env.dev.local
   ```

2. Start Convex (first run will prompt for login / project creation if you use a cloud deployment):

   ```bash
   ./glimt.sh dev convex
   ```

3. After Convex is running, copy the deployment name and client URL from the CLI output or [Convex dashboard](https://dashboard.convex.dev) into `.env.dev.local`:

   ```bash
   CONVEX_DEPLOYMENT_DEV=dev:your-deployment-name
   EXPO_PUBLIC_CONVEX_URL_DEV=https://your-deployment.convex.cloud
   ```

   For local-only development (after `pnpm exec convex init`), you can use the values from `.env.local`:

   ```bash
   CONVEX_DEPLOYMENT_DEV=anonymous:anonymous-glimt-v2
   EXPO_PUBLIC_CONVEX_URL_DEV=http://127.0.0.1:3210
   ```

## Development

Run in separate terminals:

```bash
./glimt.sh dev convex   # Convex dev watcher
./glimt.sh dev expo     # Expo dev server
```

Or via pnpm at the repo root:

```bash
pnpm convex:dev
pnpm glimt:dev
```

## Environment files

| File | Purpose |
|------|---------|
| `.env.example` | Committed template |
| `.env.dev.local` | Dev secrets (gitignored) |
| `.env.stage.local` | Staging secrets (gitignored) |
| `.env.prod.local` | Production secrets (gitignored) |
| `.env.local` | Global extras / local Convex CLI config (gitignored) |

Each per-env file should set `CONVEX_DEPLOYMENT_<ENV>` and `EXPO_PUBLIC_CONVEX_URL_<ENV>` for that environment. See `.env.example` for the full list.
