# Glimt

Minimal social app: one photo + short caption. No feed, likes, or comments — just small everyday moments from friends.

**Stack:** [Expo SDK 56](https://docs.expo.dev/versions/v56.0.0/) · [Expo Router](https://docs.expo.dev/router/introduction/) · TypeScript · [Convex](https://docs.convex.dev/)

## Prerequisites

- Node.js **^20.19.4**, **^22.13.0**, or newer (SDK 56 / React Native 0.85 expect a recent LTS)
- npm

## Setup

```bash
npm install
```

### Convex backend

**Option A — local dev (already configured if you used anonymous init):**

```bash
npx convex dev
```

**Option B — Convex cloud + EAS (recommended for production):**

```bash
eas integrations:convex:connect
npx convex dev
```

This writes `EXPO_PUBLIC_CONVEX_URL` to `.env.local`. Expo reads `EXPO_PUBLIC_*` variables automatically.

### Run the app

In a second terminal:

```bash
npm start
```

## Project layout

```
src/
  app/          # Expo Router screens
  lib/          # Shared client code (Convex client)
convex/         # Backend schema & functions
assets/         # Images, icons
```

## Scripts

| Command | Description |
|--------|-------------|
| `npm start` | Expo dev server |
| `npm run convex:dev` | Convex dev server (syncs `convex/`) |
| `npm run android` / `ios` / `web` | Platform shortcuts |

## MVP (not implemented yet)

- Take photo → caption → post
- Home screen widget: one random friend’s latest glimt
- Tap widget → open post

## Docs

- [Expo SDK 56](https://docs.expo.dev/versions/v56.0.0/)
- [Using Convex with Expo](https://docs.expo.dev/guides/using-convex/)
- [Convex React Native quickstart](https://docs.convex.dev/quickstart/react-native)
