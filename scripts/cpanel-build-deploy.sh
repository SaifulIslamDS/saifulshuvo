#!/bin/bash
set -Eeuo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOME_ROOT="${HOME:-/home2/saifulsh}"
DEPLOY_ROOT="${HOME_ROOT}/public_html"
STATE_DIR="${HOME_ROOT}/.saifulshuvo-deploy"
LOCK_DIR="${STATE_DIR}/lock"
LOG_DIR="${STATE_DIR}/logs"
LAST_GIT_FILE="${STATE_DIR}/last-git-commit"
LAST_CONTENT_FILE="${STATE_DIR}/last-content-version"
CONTENT_VERSION_URL="https://cms.saifulshuvo.com/wp-json/saifulshuvo/v1/content-version"
PNPM_VERSION="11.18.0"

mkdir -p "$STATE_DIR" "$LOG_DIR"
LOG_FILE="${LOG_DIR}/deploy-$(date -u +%Y%m%d).log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "=== SaifulShuvo cPanel deployment $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
echo "Repository: $REPO_ROOT"
echo "Deploy root: $DEPLOY_ROOT"

if [[ "$DEPLOY_ROOT" != "$HOME_ROOT/public_html" || "$DEPLOY_ROOT" == "/" || -z "$DEPLOY_ROOT" ]]; then
  echo "Refusing unsafe deployment root: $DEPLOY_ROOT" >&2
  exit 1
fi

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "Another deployment is already running. Exiting safely."
  exit 0
fi
trap 'rm -rf "$LOCK_DIR"' EXIT

# Locate CloudLinux Node.js 20 without requiring an interactive shell/Node app.
NODE_DIR=""
for candidate in \
  /opt/alt/alt-nodejs20/root/bin \
  /opt/alt/alt-nodejs20/root/usr/bin; do
  if [[ -x "$candidate/node" ]]; then
    NODE_DIR="$candidate"
    break
  fi
done

if [[ -z "$NODE_DIR" ]]; then
  system_node="$(command -v node 2>/dev/null || true)"
  if [[ -n "$system_node" ]]; then
    NODE_DIR="$(dirname "$system_node")"
  fi
fi

if [[ -z "$NODE_DIR" ]]; then
  echo "Node.js executable not found. The hosting provider must expose CloudLinux Node.js 20 to deployment tasks." >&2
  exit 1
fi

export PATH="$NODE_DIR:$PATH"
NODE_BIN="$NODE_DIR/node"
NPM_BIN="$(command -v npm 2>/dev/null || true)"
NPX_BIN="$(command -v npx 2>/dev/null || true)"

echo "Node: $($NODE_BIN -v) ($NODE_BIN)"

if [[ -z "$NPX_BIN" && -z "$NPM_BIN" ]]; then
  echo "Neither npx nor npm is available beside Node.js." >&2
  exit 1
fi

cd "$REPO_ROOT"
CURRENT_GIT="$(git rev-parse HEAD)"
LAST_GIT="$(cat "$LAST_GIT_FILE" 2>/dev/null || true)"

CURL_BIN="$(command -v curl 2>/dev/null || true)"
if [[ -z "$CURL_BIN" ]]; then
  echo "curl is required to read the WordPress content version." >&2
  exit 1
fi

VERSION_JSON="$($CURL_BIN -fsS --connect-timeout 10 --max-time 20 \
  -H 'Accept: application/json' \
  -H 'Cache-Control: no-cache' \
  "$CONTENT_VERSION_URL")"

CURRENT_CONTENT="$(printf '%s' "$VERSION_JSON" | "$NODE_BIN" -e '
let data="";
process.stdin.on("data", d => data += d);
process.stdin.on("end", () => {
  try {
    const parsed = JSON.parse(data);
    const version = Number(parsed.contentVersion);
    if (!Number.isFinite(version) || version < 1) process.exit(2);
    process.stdout.write(String(Math.trunc(version)));
  } catch (error) {
    process.exit(1);
  }
});
')"
LAST_CONTENT="$(cat "$LAST_CONTENT_FILE" 2>/dev/null || true)"

echo "Git commit: current=$CURRENT_GIT last=${LAST_GIT:-none}"
echo "CMS content version: current=$CURRENT_CONTENT last=${LAST_CONTENT:-none}"

if [[ "$CURRENT_GIT" == "$LAST_GIT" && "$CURRENT_CONTENT" == "$LAST_CONTENT" ]]; then
  echo "No code or CMS content change detected. Nothing to build."
  exit 0
fi

# Build-time environment for the static Next.js export.
export NEXT_PUBLIC_SITE_URL="https://saifulshuvo.com"
export WORDPRESS_URL="https://cms.saifulshuvo.com"
export WORDPRESS_GRAPHQL_URL="https://cms.saifulshuvo.com/graphql"
export NEXT_PUBLIC_WORDPRESS_REST_URL="https://cms.saifulshuvo.com/wp-json/saifulshuvo/v1"
export WORDPRESS_ALLOW_FALLBACK="false"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1536}"

run_pnpm() {
  if [[ -n "$NPX_BIN" ]]; then
    "$NPX_BIN" --yes "pnpm@${PNPM_VERSION}" "$@"
  else
    "$NPM_BIN" exec --yes "pnpm@${PNPM_VERSION}" -- "$@"
  fi
}

echo "Installing/verifying dependencies..."
run_pnpm install --frozen-lockfile --prefer-offline

echo "Verifying live WordPress contract..."
run_pnpm verify:wordpress

echo "Auditing static architecture..."
run_pnpm audit:architecture

echo "Running typecheck..."
run_pnpm typecheck

echo "Building static export..."
run_pnpm build

echo "Validating static export..."
run_pnpm check:static

if [[ ! -f "$REPO_ROOT/out/index.html" || ! -f "$REPO_ROOT/out/.htaccess" ]]; then
  echo "Validated build is missing required deployment files." >&2
  exit 1
fi

mkdir -p "$DEPLOY_ROOT"

RSYNC_BIN="$(command -v rsync 2>/dev/null || true)"
if [[ -n "$RSYNC_BIN" ]]; then
  echo "Deploying with rsync..."
  "$RSYNC_BIN" -a --delete \
    --exclude='.well-known/' \
    --exclude='cgi-bin/' \
    "$REPO_ROOT/out/" "$DEPLOY_ROOT/"
else
  echo "rsync unavailable; using guarded copy fallback..."
  find "$DEPLOY_ROOT" -mindepth 1 -maxdepth 1 \
    ! -name '.well-known' \
    ! -name 'cgi-bin' \
    -exec rm -rf -- {} +
  /bin/cp -a "$REPO_ROOT/out/." "$DEPLOY_ROOT/"
fi

printf '%s\n' "$CURRENT_GIT" > "$LAST_GIT_FILE"
printf '%s\n' "$CURRENT_CONTENT" > "$LAST_CONTENT_FILE"

echo "Deployment successful."
echo "Live: https://saifulshuvo.com"
echo "Recorded Git commit: $CURRENT_GIT"
echo "Recorded CMS content version: $CURRENT_CONTENT"
