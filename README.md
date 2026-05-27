# Glimt

Minimal social app: one photo + short caption. No feed, likes, or comments — just small everyday moments from friends.

**Stack:** [Expo SDK 56](https://docs.expo.dev/versions/v56.0.0/) · [Expo Router](https://docs.expo.dev/router/introduction/) · TypeScript · [Convex](https://docs.convex.dev/)

## Project layout

```
glimt/
  convex/       # Backend schema & functions (run CLI from repo root)
  mobile/       # Expo React Native app
```

## Prerequisites

- Node.js **^20.19.4**, **^22.13.0**, or newer
- npm

## Setup

From the **repo root**:

```bash
npm install
```

### Convex backend

```bash
npm run convex:dev
```

Uses `.env.local` at the repo root (`CONVEX_DEPLOYMENT`). After `convex dev` or `eas integrations:convex:connect`, ensure `mobile/.env.local` has the `EXPO_PUBLIC_CONVEX_*` URLs (see `mobile/.env.example`).

Set `MOBILE_ENVIRONMENT=dev|stage|prod` in `mobile/.env.local` to pick app name, icons, bundle id, and URL scheme (default: `dev`).

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
| `npm run convex:dev` | Convex dev server |
| `npm start` | Expo dev server (`mobile/`, uses `MOBILE_ENVIRONMENT` from `.env.local`) |
| `npm run start:dev` / `start:stage` / `start:prod` | Start with a specific environment (in `mobile/`) |
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

2. Build per channel (fingerprint skipped — see `mobile/package.json`):

   ```bash
   cd mobile
   npm run build:ios:development
   npm run build:ios:staging
   npm run build:ios:production
   ```

   Or any profile: `npm run eas:build -- --profile development --platform ios --clear-cache`

   One-off without npm scripts (PowerShell):

   ```powershell
   $env:EAS_SKIP_AUTO_FINGERPRINT="1"; eas build --profile development --platform ios --clear-cache
   ```

3. Publish JS updates:

   ```bash
   npm run update:development -- --message "your message"
   npm run update:staging -- --message "your message"
   npm run update:production -- --message "your message"
   ```

   Staging builds use the **preview** EAS environment for secrets; the OTA channel is still `staging`.

### Device builds and Convex

`EXPO_PUBLIC_CONVEX_URL` from `mobile/.env.local` is **not** included automatically in EAS builds. Add it to the matching EAS environment (or project secret) before building, for example:

```bash
cd mobile
eas env:create --name EXPO_PUBLIC_CONVEX_URL --value "https://YOUR.deployment.convex.cloud" --environment development
```

Without it, the app shows a configuration screen instead of crashing silently.

## MVP (not implemented yet)

- Take photo → caption → post
- Home screen widget: one random friend’s latest glimt
- Tap widget → open post

## Docs

- [Expo SDK 56](https://docs.expo.dev/versions/v56.0.0/)
- [Using Convex with Expo](https://docs.expo.dev/guides/using-convex/)
- [Convex React Native quickstart](https://docs.convex.dev/quickstart/react-native)
