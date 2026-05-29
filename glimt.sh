#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 <dev|stage|prod> <convex|expo|build> [args...]"
  echo ""
  echo "Examples:"
  echo "  $0 dev convex              # convex dev (watcher)"
  echo "  $0 stage convex deploy"
  echo "  $0 dev expo"
  echo "  $0 dev build ios           # EAS build, skip fingerprint"
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

ENV_PRIMARY="$ROOT_DIR/.env.${ENVIRONMENT}.local"
ENV_FALLBACK="$ROOT_DIR/.env.${ENVIRONMENT}"
ENV_GLOBAL="$ROOT_DIR/.env.local"

load_env_file() {
  local f="$1"
  if [ -f "$f" ]; then
    set -a
    # shellcheck disable=SC1090
    source "$f"
    set +a
  fi
}

# Load env in order: env-specific → global
if [ -f "$ENV_PRIMARY" ]; then
  load_env_file "$ENV_PRIMARY"
elif [ -f "$ENV_FALLBACK" ]; then
  load_env_file "$ENV_FALLBACK"
else
  echo "[glimt] Missing $ENV_PRIMARY (or $ENV_FALLBACK). Create it from .env.example"
fi
load_env_file "$ENV_GLOBAL"

export MOBILE_ENVIRONMENT="$ENVIRONMENT"

DEPLOYMENT_VAR="CONVEX_DEPLOYMENT_${ENVIRONMENT^^}"
if [ -n "${!DEPLOYMENT_VAR:-}" ]; then
  export CONVEX_DEPLOYMENT="${!DEPLOYMENT_VAR}"
fi

if [ -z "${CONVEX_DEPLOYMENT:-}" ] && [ "$SERVICE" = "convex" ]; then
  echo "[glimt] Missing $DEPLOYMENT_VAR (or CONVEX_DEPLOYMENT) in $ENV_PRIMARY / $ENV_FALLBACK"
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
  (cd "$ROOT_DIR" && npx convex "${args[@]}") &
  CONVEX_PID="$!"
}

start_expo() {
  local script="start:${ENVIRONMENT}"
  echo "[glimt] expo env=${ENVIRONMENT}"
  (cd "$MOBILE_DIR" && npm run "$script") &
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

  export EAS_SKIP_AUTO_FINGERPRINT=1

  local eas_args=(build --profile "$eas_profile" --platform "$platform")
  for arg in "$@"; do
    eas_args+=("$arg")
  done

  echo "[glimt] eas build profile=${eas_profile} platform=${platform} env=${ENVIRONMENT}"
  cd "$MOBILE_DIR"
  npx eas "${eas_args[@]}"
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
