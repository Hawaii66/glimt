#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 <dev|stage|prod> <convex|expo|build> [args...]"
  echo ""
  echo "Examples:"
  echo "  $0 dev convex              # convex dev (watcher)"
  echo "  $0 stage convex deploy"
  echo "  $0 dev expo"
  echo "  $0 dev build ios           # EAS build"
  echo "  $0 stage build ios --clear-cache"
  echo "  $0 prod build android"
}

if [ "$#" -lt 2 ]; then
  usage
  exit 1
fi

ENVIRONMENT="$1"
SERVICE="$2"
shift 2

if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "stage" && "$ENVIRONMENT" != "prod" ]]; then
  usage
  exit 1
fi

if [[ "$SERVICE" != "convex" && "$SERVICE" != "expo" && "$SERVICE" != "build" ]]; then
  usage
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$ROOT_DIR/mobile"
DOPPLER_PROJECT="${DOPPLER_PROJECT:-glimt}"

ensure_doppler() {
  if ! command -v doppler >/dev/null 2>&1; then
    echo "[glimt] Doppler CLI required. Install: https://docs.doppler.com/docs/install-cli"
    exit 1
  fi
}

if [ -z "${GLIMT_DOPPLER_LOADED:-}" ]; then
  ensure_doppler
  export GLIMT_DOPPLER_LOADED=1
  exec doppler run --project "$DOPPLER_PROJECT" --config "$ENVIRONMENT" -- "$0" "$ENVIRONMENT" "$SERVICE" "$@"
fi

# Git Bash on Windows often resolves `pnpm` to AppData\Local\pnpm\pnpm (not runnable).
# Prefer pnpm.cmd from `npm install -g pnpm`.
glimt_pnpm() {
  if [[ -n "${MSYSTEM:-}" ]] && command -v pnpm.cmd >/dev/null 2>&1; then
    pnpm.cmd "$@"
    return
  fi
  if command -v pnpm >/dev/null 2>&1; then
    local pnpm_bin
    pnpm_bin="$(command -v pnpm)"
    case "$pnpm_bin" in
      *[\\/]AppData[\\/]Local[\\/]pnpm[\\/]pnpm)
        if command -v pnpm.cmd >/dev/null 2>&1; then
          pnpm.cmd "$@"
        else
          npx pnpm@10.12.4 "$@"
        fi
        ;;
      *) pnpm "$@" ;;
    esac
    return
  fi
  if command -v pnpm.cmd >/dev/null 2>&1; then
    pnpm.cmd "$@"
    return
  fi
  npx pnpm@10.12.4 "$@"
}

export MOBILE_ENVIRONMENT="$ENVIRONMENT"

if [ -z "${CONVEX_DEPLOYMENT:-}" ] && [ "$SERVICE" = "convex" ]; then
  echo "[glimt] Missing CONVEX_DEPLOYMENT in Doppler config '${ENVIRONMENT}'"
  echo "[glimt] Set it to the deployment name from Convex dashboard (Settings → Deployment name)."
  exit 1
fi

eas_profile_for_env() {
  case "$ENVIRONMENT" in
    dev) echo "development" ;;
    stage) echo "staging" ;;
    prod) echo "production" ;;
  esac
}

CONVEX_PID=""
EXPO_PID=""

cleanup() {
  if [ -n "${EXPO_PID:-}" ] && kill -0 "${EXPO_PID}" 2>/dev/null; then
    kill "${EXPO_PID}" 2>/dev/null || true
  fi
  if [ -n "${CONVEX_PID:-}" ] && kill -0 "${CONVEX_PID}" 2>/dev/null; then
    kill "${CONVEX_PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

start_convex() {
  local args=("$@")
  if [ "${#args[@]}" -eq 0 ]; then
    args=("dev")
  fi

  echo "[glimt] convex deployment=${CONVEX_DEPLOYMENT} env=${ENVIRONMENT}"
  (cd "$ROOT_DIR" && glimt_pnpm exec convex "${args[@]}") &
  CONVEX_PID="$!"
}

start_expo() {
  local script="start:${ENVIRONMENT}"
  echo "[glimt] expo env=${ENVIRONMENT}"
  (cd "$MOBILE_DIR" && glimt_pnpm run "$script") &
  EXPO_PID="$!"
}

run_eas_build() {
  local platform="${1:-ios}"
  shift || true

  if [[ "$platform" != "ios" && "$platform" != "android" && "$platform" != "all" ]]; then
    echo "[glimt] Platform must be ios, android, or all (got: $platform)"
    exit 1
  fi

  local eas_profile
  eas_profile="$(eas_profile_for_env)"

  local eas_args=(build --profile "$eas_profile" --platform "$platform")
  for arg in "$@"; do
    eas_args+=("$arg")
  done

  echo "[glimt] eas build profile=${eas_profile} platform=${platform} env=${ENVIRONMENT}"
  echo "[glimt] upload excludes node_modules via ${ROOT_DIR}/.easignore"
  cd "$MOBILE_DIR"
  export EXPO_NO_DOTENV=1
  export MOBILE_ENVIRONMENT="$ENVIRONMENT"
  export EAS_PROJECT_ID="${EAS_PROJECT_ID:-b92605ee-1590-47dd-a260-11dc4b24b3bf}"
  glimt_pnpm exec eas "${eas_args[@]}"
}

if [ "$SERVICE" = "convex" ]; then
  start_convex "$@"
  wait "$CONVEX_PID"
elif [ "$SERVICE" = "expo" ]; then
  start_expo
  wait "$EXPO_PID"
elif [ "$SERVICE" = "build" ]; then
  trap - EXIT INT TERM
  run_eas_build "$@"
fi
