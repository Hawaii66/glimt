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
| `npm start` | Expo dev server (`mobile/`) |
| `npm run android` / `ios` / `web` | Platform shortcuts |

## MVP (not implemented yet)

- Take photo → caption → post
- Home screen widget: one random friend’s latest glimt
- Tap widget → open post

## Docs

- [Expo SDK 56](https://docs.expo.dev/versions/v56.0.0/)
- [Using Convex with Expo](https://docs.expo.dev/guides/using-convex/)
- [Convex React Native quickstart](https://docs.convex.dev/quickstart/react-native)
