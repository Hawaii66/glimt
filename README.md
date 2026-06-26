# Glimt v2

pnpm monorepo with Convex backend and Expo mobile app.

## Structure

```text
glimt-v2/
├── convex/     # Convex functions (CLI runs from repo root)
├── expo/       # Expo app (glimt-expo workspace package)
├── packages/   # Shared workspace packages (empty for now)
├── doppler.yaml
└── glimt.sh    # Environment-aware dev orchestrator
```

## Prerequisites

- Node.js 22+
- pnpm 10.12.4 (`corepack enable && corepack prepare pnpm@10.12.4 --activate`)
- [Doppler CLI](https://docs.doppler.com/docs/install-cli)

## Install

```bash
pnpm install
```

## Secrets (Doppler)

Secrets live in [Doppler](https://www.doppler.com/) instead of local `.env` files.

1. Log in and link this repo (uses `doppler.yaml` — project `glimt`, default config `dev`):

   ```bash
   doppler login
   doppler setup
   ```

2. Create Doppler configs `dev`, `stage`, and `prod` if they do not exist yet.

3. Add secrets to each config. See `.env.example` for the variable names. Each config should set at least:

   ```bash
   doppler secrets set CONVEX_DEPLOYMENT --config dev
   doppler secrets set EXPO_PUBLIC_CONVEX_URL --config dev
   ```

   Example values after Convex is running:

   ```bash
   CONVEX_DEPLOYMENT=dev:your-deployment-name
   EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
   ```

   For local-only development (after `pnpm exec convex init`):

   ```bash
   CONVEX_DEPLOYMENT=anonymous:anonymous-glimt-v2
   EXPO_PUBLIC_CONVEX_URL=http://127.0.0.1:3210
   ```

## First-time Convex setup

1. Ensure Doppler `dev` config has placeholder secrets (or set them after step 2).

2. Start Convex (first run will prompt for login / project creation if you use a cloud deployment):

   ```bash
   ./glimt.sh dev convex
   ```

3. Copy the deployment name and client URL from the CLI output or [Convex dashboard](https://dashboard.convex.dev) into Doppler:

   ```bash
   doppler secrets set CONVEX_DEPLOYMENT "dev:your-deployment-name" --config dev
   doppler secrets set EXPO_PUBLIC_CONVEX_URL "https://your-deployment.convex.cloud" --config dev
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

`glimt.sh` injects secrets from Doppler automatically (`doppler run --config <env>`).

To run a one-off command with secrets:

```bash
doppler run --config dev -- pnpm exec convex dev
```

## Doppler configs

| Config | Used by |
|--------|---------|
| `dev` | `./glimt.sh dev …`, local development |
| `stage` | `./glimt.sh stage …`, staging builds |
| `prod` | `./glimt.sh prod …`, production builds |

Each config holds that environment's `CONVEX_DEPLOYMENT`, `EXPO_PUBLIC_CONVEX_URL`, and related values. See `.env.example` for the full list.
