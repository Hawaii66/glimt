# Glimt

Minimal social app: one photo + short caption. No feed, likes, or comments — just small everyday moments from friends.

**Stack:** [Expo SDK 56](https://docs.expo.dev/versions/v56.0.0/) · [Expo Router](https://docs.expo.dev/router/introduction/) · TypeScript · [Convex](https://docs.convex.dev/)

## Project layout

```
glimt/                    # pnpm workspaces monorepo (Expo + Convex)
  convex/                 # Backend schema & functions (run CLI from repo root)
  mobile/                 # Expo React Native app (EAS project root)
  packages/
    date/                 # Shared @glimt/date package (mobile + convex)
  doppler.yaml            # Doppler project/config defaults
  glimt.sh                # Environment-aware dev orchestrator (loads Doppler)
```

## Prerequisites

- Node.js **^20.19.4**, **^22.13.0**, or newer
- [pnpm](https://pnpm.io/) 10.x
- [Doppler CLI](https://docs.doppler.com/docs/install-cli)

## Setup

From the **repo root**:

```bash
npm install -g pnpm@10.12.4
pnpm.cmd install
```

### Windows: `PNPM_HOME` / broken `pnpm` in Git Bash

Running `pnpm setup` (or the standalone installer) adds:

```text
PNPM_HOME=C:\Users\hawai\AppData\Local\pnpm
```

and puts that folder on **PATH**. In Git Bash that often breaks with  
`'...\AppData\Local\pnpm\pnpm' is not recognized` because the shim there is not a normal Windows executable.

**Recommended for this repo:** use the **npm global** CLI instead of the standalone install.

1. Remove the standalone setup (Windows → Environment Variables → User):
   - Delete variable **`PNPM_HOME`**
   - Remove **`C:\Users\hawai\AppData\Local\pnpm`** from **Path**
   - Ensure **npm’s global bin folder** is on Path (see below)
2. Install via npm (once):

   ```bash
   npm install -g pnpm@10.12.4
   ```

3. In Git Bash, either use `pnpm.cmd` explicitly, or source the project helper:

   ```bash
   source scripts/pnpm-git-bash.sh
   pnpm install
   ```

`./glimt.sh` already calls `pnpm.cmd` on Git Bash when needed.

**Where is npm’s global folder?** It is usually **Roaming**, not Local:

| What you might look for | Actual path on this machine |
|-------------------------|-----------------------------|
| `AppData\Local\npm` | ❌ not used for npm globals |
| `%APPDATA%\npm` | ✅ `C:\Users\hawai\AppData\Roaming\npm` |

`%APPDATA%` is an environment variable (→ `...\AppData\Roaming`). You will not see a folder literally named `%APPDATA%` in Explorer. Check yours:

```powershell
npm config get prefix
# e.g. C:\Users\hawai\AppData\Roaming\npm
```

Add **that** path to user **Path** if `pnpm.cmd` is not found in a new terminal. After `npm install -g pnpm`, confirm:

```powershell
Test-Path "$env:APPDATA\npm\pnpm.cmd"   # should be True
where.exe pnpm.cmd
```

### Secrets (Doppler)

Secrets live in [Doppler](https://www.doppler.com/) instead of local `.env` files.

1. Log in and link this repo (uses `doppler.yaml` — project `glimt`, default config `dev`):

   ```bash
   doppler login
   doppler setup
   ```

2. Create Doppler configs `dev` and `prod` if they do not exist yet.

3. Add secrets to each config. See `.env.example` for variable names. Each config should set at least:

   ```bash
   doppler secrets set CONVEX_DEPLOYMENT "dev:your-deployment-name" --config dev
   doppler secrets set EXPO_PUBLIC_CONVEX_URL "https://your-deployment.convex.cloud" --config dev
   ```

   For local-only development (after `pnpm exec convex init`):

   ```bash
   CONVEX_DEPLOYMENT=anonymous:anonymous-glimt-v2
   EXPO_PUBLIC_CONVEX_URL=http://127.0.0.1:3210
   ```

`glimt.sh` injects secrets from Doppler automatically (`doppler run --config <env>`).

To run a one-off command with secrets:

```bash
doppler run --config dev -- pnpm exec convex dev
```

| Doppler config | Used by |
|----------------|---------|
| `dev` | `./glimt.sh dev …`, local development |
| `prod` | `./glimt.sh prod …`, production builds |

Each config holds that environment's `CONVEX_DEPLOYMENT`, `EXPO_PUBLIC_CONVEX_URL`, and related values.

### Convex backend (cloud per environment)

Glimt uses **two Convex cloud deployments** aligned with `MOBILE_ENVIRONMENT` (`dev`, `prod`).

1. In the [Convex dashboard](https://dashboard.convex.dev), create or pick a **cloud** deployment for each environment.
2. Paste each deployment name and `.convex.cloud` URL into the matching Doppler config.
3. Run the backend for the environment you are working on:

```bash
pnpm run convex:dev          # Doppler config: dev
pnpm run convex:prod         # Doppler config: prod
```

Deploy backend code to prod:

```bash
pnpm run convex:deploy:prod
```

Set Convex Auth / Apple secrets **per deployment** (repeat for each env):

```bash
pnpm run convex:dev -- env set AUTH_APPLE_ID app.glimt.mobile.dev
```

(`pnpm run convex:dev --` forwards extra args to the Convex CLI.)

`MOBILE_ENVIRONMENT=dev|prod` selects app name, icons, bundle id, scheme, and which Convex URL the mobile app uses.

### Run the mobile app

In a second terminal, from the repo root:

```bash
pnpm start                   # runs ./glimt.sh dev expo (Doppler config: dev)
```

Or use glimt directly:

```bash
./glimt.sh dev expo
```

From `mobile/` (requires secrets already in the shell — use glimt.sh from repo root instead):

```bash
cd mobile
doppler run --config dev -- pnpm start
```

## Scripts (repo root)

| Command | Description |
|--------|-------------|
| `pnpm run convex:dev` | Convex dev → **dev** cloud deployment |
| `pnpm run convex:prod` | Convex dev → prod deployment |
| `pnpm run convex:deploy:prod` | Push backend to prod |
| `pnpm start` | Expo + **dev** Convex URL (Doppler config: `dev`) |
| `pnpm run glimt:prod` | Expo with prod Convex URL |
| `pnpm run android` / `ios` / `web` | Platform shortcuts |

## EAS Update (OTA)

Two channels: **development** and **production** (see `mobile/eas.json`).

EAS detects **pnpm** from `pnpm-lock.yaml` at the repo root and runs `pnpm install` on the build worker.

1. From `mobile/`, link EAS and configure updates:

   ```bash
   pnpm exec eas login
   pnpm exec eas init
   pnpm exec eas update:configure
   ```

   Add `EAS_PROJECT_ID` to Doppler (optional — default is in `mobile/app.config.ts`) or let `eas init` write it into the config.

2. Build per channel (from **repo root** — loads Doppler config and sets `MOBILE_ENVIRONMENT`):

   ```bash
   ./glimt.sh dev build ios
   ./glimt.sh prod build ios
   ```

   Same via pnpm: `pnpm run eas:build:dev`, `eas:build:prod`. Extra EAS flags go after the platform, e.g. `./glimt.sh dev build ios --clear-cache`.

   Or from `mobile/`: `pnpm run build:ios:development` (no Doppler injection from root).

   Verify fingerprint locally before building:

   ```bash
   cd mobile
   pnpm run fingerprint
   ```

   EAS upload rules live in the **repo root** `.easignore` (not `mobile/`). If a build hangs on “Compressing project files”, check the archive size:

   ```bash
   cd mobile
   pnpm exec eas-cli build:inspect --platform ios --stage archive --output %TEMP%\eas-inspect --profile development
   ```

   It should be a few MB without `node_modules/`. Projects on OneDrive can also slow compression — pause sync or move the repo off OneDrive if uploads stay stuck.

3. Publish JS updates:

   ```bash
   pnpm --filter glimt-mobile run update:development -- --message "your message"
   pnpm --filter glimt-mobile run update:production -- --message "your message"
   ```

### Device builds and Convex

EAS cloud builds read `EXPO_PUBLIC_CONVEX_URL` from the matching EAS environment. Set each before building:

```bash
cd mobile
pnpm exec eas env:create --name EXPO_PUBLIC_CONVEX_URL --value "https://YOUR-DEV.convex.cloud" --environment development
pnpm exec eas env:create --name EXPO_PUBLIC_CONVEX_URL --value "https://YOUR-PROD.convex.cloud" --environment production
```

Local EAS builds via `./glimt.sh <env> build …` inject secrets from Doppler instead.

Without the correct variable, the app shows a configuration screen.

## Sign in with Apple (Convex Auth)

The app uses [Convex Auth](https://labs.convex.dev/auth) with native iOS Sign in with Apple (`expo-apple-authentication`), not the browser OAuth flow.

### 1. Generate Convex Auth keys

```bash
node scripts/generate-convex-auth-keys.mjs
```

Copy the output into your Convex deployment environment variables: `JWT_PRIVATE_KEY` and `JWKS`.

Also set:

```bash
pnpm exec convex env set SITE_URL exp://127.0.0.1:8081
```

Adjust the port if Metro uses another one. For production builds, use your app scheme (for example `glimt-dev://`).

### 2. Configure Apple credentials in Convex

For **native iOS** sign-in, `AUTH_APPLE_ID` must be your **App ID / bundle identifier** (for dev: `app.glimt.mobile.dev`), not the web Services ID.

Create a Sign in with Apple key in [Apple Developer](https://developer.apple.com/account/resources/authkeys/list), then generate the client secret JWT (see [Convex Auth Apple docs](https://labs.convex.dev/auth/config/oauth/apple)).

```bash
pnpm exec convex env set AUTH_APPLE_ID app.glimt.mobile.dev
pnpm exec convex env set AUTH_APPLE_SECRET "<generated-jwt-secret>"
```

### 3. Run locally

Terminal 1:

```bash
pnpm run convex:dev
```

Terminal 2:

```bash
pnpm start
```

Open the **development client** build on a physical iPhone (Sign in with Apple does not work fully in Expo Go for production-like flows).

After changing native config (`expo-apple-authentication` plugin), rebuild the dev client:

```bash
cd mobile
pnpm run build:ios:development
```

## MVP (not implemented yet)

- Take photo → caption → post
- Home screen widget: one random friend’s latest glimt
- Tap widget → open post

## Docs

- [Expo SDK 56](https://docs.expo.dev/versions/v56.0.0/)
- [Expo monorepos](https://docs.expo.dev/guides/monorepos/)
- [Using Convex with Expo](https://docs.expo.dev/guides/using-convex/)
- [Convex React Native quickstart](https://docs.convex.dev/quickstart/react-native)
