# Glimt

Minimal social app: one photo + short caption. No feed, likes, or comments — just small everyday moments from friends.

**Stack:** [Expo SDK 56](https://docs.expo.dev/versions/v56.0.0/) · [Expo Router](https://docs.expo.dev/router/introduction/) · TypeScript · [Convex](https://docs.convex.dev/)

## Project layout

```
glimt/                    # npm workspaces monorepo (Expo + Convex)
  convex/                 # Backend schema & functions (run CLI from repo root)
  mobile/                 # Expo React Native app (EAS project root)
  packages/
    date/                 # Shared @glimt/date package (mobile + convex)
```

## Prerequisites

- Node.js **^20.19.4**, **^22.13.0**, or newer
- npm

## Setup

From the **repo root**:

```bash
npm install
```

### Convex backend (cloud per environment)

Glimt uses **three Convex cloud deployments** aligned with `MOBILE_ENVIRONMENT`:

| App env | Convex CLI file | Deployment var | Expo URL var |
|--------|-----------------|----------------|--------------|
| `dev` | `.env.dev.local` | `CONVEX_DEPLOYMENT_DEV` | `EXPO_PUBLIC_CONVEX_URL_DEV` |
| `stage` | `.env.stage.local` | `CONVEX_DEPLOYMENT_STAGE` | `EXPO_PUBLIC_CONVEX_URL_STAGE` |
| `prod` | `.env.prod.local` | `CONVEX_DEPLOYMENT_PROD` | `EXPO_PUBLIC_CONVEX_URL_PROD` |

1. Copy `.env.example` → `.env.dev.local`, `.env.stage.local`, `.env.prod.local`
2. In the [Convex dashboard](https://dashboard.convex.dev), create or pick a **cloud** deployment for each (e.g. shared dev deployment + separate stage/prod). Paste each deployment name and `.convex.cloud` URL into the matching file.
3. Run the backend for the environment you are working on:

```bash
npm run convex:dev          # uses .env.dev.local
npm run convex:dev:stage    # uses .env.stage.local
npm run convex:dev:prod     # uses .env.prod.local
```

Deploy backend code to stage/prod:

```bash
npm run convex:deploy:stage
npm run convex:deploy:prod
```

Set Convex Auth / Apple secrets **per deployment** (repeat for each env):

```bash
npm run convex:dev -- env set AUTH_APPLE_ID app.glimt.mobile.dev
```

(`npm run convex:dev --` forwards extra args to the Convex CLI.)

`MOBILE_ENVIRONMENT=dev|stage|prod` selects app name, icons, bundle id, scheme, and which Convex URL the mobile app uses.

### Run the mobile app

In a second terminal, from the repo root:

```bash
npm start
```

Or from `mobile/`:

```bash
cd mobile
npm start
```

## Scripts (repo root)

| Command | Description |
|--------|-------------|
| `npm run convex:dev` | Convex dev → **dev** cloud deployment |
| `npm run convex:dev:stage` / `convex:dev:prod` | Convex dev → stage / prod deployment |
| `npm run convex:deploy:stage` / `convex:deploy:prod` | Push backend to stage / prod |
| `npm start` | Expo + **dev** Convex URL (`.env.dev.local`) |
| `npm run start:dev` / `start:stage` / `start:prod` | Expo with matching Convex URL (in `mobile/`) |
| `npm run android` / `ios` / `web` | Platform shortcuts |

## EAS Update (OTA)

Three channels: **development**, **staging**, **production** (see `mobile/eas.json`).

1. From `mobile/`, link EAS and configure updates:

   ```bash
   eas login
   eas init
   eas update:configure
   ```

   Add `EAS_PROJECT_ID` to `mobile/.env.local` (or let `eas init` write it into the config).

2. Build per channel (from `mobile/`):

   ```bash
   cd mobile
   npm run build:ios:development
   npm run build:ios:staging
   npm run build:ios:production
   ```

   Or any profile: `npm run eas:build -- --profile development --platform ios --clear-cache`

   Verify fingerprint locally before building:

   ```bash
   cd mobile
   npm run fingerprint
   ```

3. Publish JS updates:

   ```bash
   npm run update:development -- --message "your message"
   npm run update:staging -- --message "your message"
   npm run update:production -- --message "your message"
   ```

   Staging builds use the **preview** EAS environment for secrets; the OTA channel is still `staging`.

### Device builds and Convex

EAS builds read the URL for the active `MOBILE_ENVIRONMENT` (`EXPO_PUBLIC_CONVEX_URL_DEV`, `_STAGE`, or `_PROD`). Set each in the matching EAS environment before building:

```bash
cd mobile
eas env:create --name EXPO_PUBLIC_CONVEX_URL_DEV --value "https://YOUR-DEV.convex.cloud" --environment development
eas env:create --name EXPO_PUBLIC_CONVEX_URL_STAGE --value "https://YOUR-STAGE.convex.cloud" --environment preview
eas env:create --name EXPO_PUBLIC_CONVEX_URL_PROD --value "https://YOUR-PROD.convex.cloud" --environment production
```

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
npx convex env set SITE_URL exp://127.0.0.1:8081
```

Adjust the port if Metro uses another one. For production builds, use your app scheme (for example `glimt-dev://`).

### 2. Configure Apple credentials in Convex

For **native iOS** sign-in, `AUTH_APPLE_ID` must be your **App ID / bundle identifier** (for dev: `app.glimt.mobile.dev`), not the web Services ID.

Create a Sign in with Apple key in [Apple Developer](https://developer.apple.com/account/resources/authkeys/list), then generate the client secret JWT (see [Convex Auth Apple docs](https://labs.convex.dev/auth/config/oauth/apple)).

```bash
npx convex env set AUTH_APPLE_ID app.glimt.mobile.dev
npx convex env set AUTH_APPLE_SECRET "<generated-jwt-secret>"
```

### 3. Run locally

Terminal 1:

```bash
npm run convex:dev
```

Terminal 2:

```bash
cd mobile
npm start
```

Open the **development client** build on a physical iPhone (Sign in with Apple does not work fully in Expo Go for production-like flows).

After changing native config (`expo-apple-authentication` plugin), rebuild the dev client:

```bash
cd mobile
npm run build:ios:development
```

## MVP (not implemented yet)

- Take photo → caption → post
- Home screen widget: one random friend’s latest glimt
- Tap widget → open post

## Docs

- [Expo SDK 56](https://docs.expo.dev/versions/v56.0.0/)
- [Using Convex with Expo](https://docs.expo.dev/guides/using-convex/)
- [Convex React Native quickstart](https://docs.convex.dev/quickstart/react-native)
