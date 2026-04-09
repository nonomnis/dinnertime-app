#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# DinnerTime — Automated DigitalOcean Deployment Script
# ============================================================================
#
# This script will:
#   1. Create a managed PostgreSQL database cluster
#   2. Create a DigitalOcean App Platform app with the database attached
#   3. Run database migrations and seed data
#   4. Output your live app URL
#
# PREREQUISITES:
#   - doctl CLI installed (https://docs.digitalocean.com/reference/doctl/how-to/install/)
#   - A DigitalOcean API token
#   - Google OAuth credentials (Client ID + Secret)
#   - Git repo pushed to GitHub (the script will prompt you)
#
# USAGE:
#   chmod +x deploy.sh
#   ./deploy.sh
#
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() { echo -e "\n${BLUE}==>${NC} ${1}"; }
print_success() { echo -e "${GREEN}✓${NC} ${1}"; }
print_warn() { echo -e "${YELLOW}⚠${NC} ${1}"; }
print_error() { echo -e "${RED}✗${NC} ${1}"; }

# ---------------------------------------------------------------------------
# Configuration — edit these or the script will prompt you
# ---------------------------------------------------------------------------
APP_NAME="${DINNERTIME_APP_NAME:-dinnertime}"
REGION="${DINNERTIME_REGION:-nyc1}"
DB_NAME="${DINNERTIME_DB_NAME:-dinnertime-db}"
DB_SIZE="${DINNERTIME_DB_SIZE:-db-s-1vcpu-1gb}"  # $15/mo basic
DB_ENGINE="pg"
DB_VERSION="16"
DB_NUM_NODES=1

# ---------------------------------------------------------------------------
# Preflight checks
# ---------------------------------------------------------------------------
print_step "Checking prerequisites..."

if ! command -v doctl &> /dev/null; then
  print_error "doctl CLI not found. Install it first:"
  echo "  brew install doctl          # macOS"
  echo "  sudo snap install doctl     # Ubuntu"
  echo "  choco install doctl         # Windows"
  echo "  https://docs.digitalocean.com/reference/doctl/how-to/install/"
  exit 1
fi
print_success "doctl found"

if ! command -v git &> /dev/null; then
  print_error "git not found. Please install git."
  exit 1
fi
print_success "git found"

# ---------------------------------------------------------------------------
# Authenticate with DigitalOcean
# ---------------------------------------------------------------------------
print_step "Authenticating with DigitalOcean..."

# Check if already authenticated
if doctl account get &> /dev/null; then
  ACCOUNT_EMAIL=$(doctl account get --format Email --no-header)
  print_success "Already authenticated as ${ACCOUNT_EMAIL}"
  read -p "Use this account? (y/n): " USE_EXISTING
  if [[ "$USE_EXISTING" != "y" && "$USE_EXISTING" != "Y" ]]; then
    read -sp "Enter your DigitalOcean API token: " DO_TOKEN
    echo
    doctl auth init --access-token "$DO_TOKEN"
  fi
else
  read -sp "Enter your DigitalOcean API token: " DO_TOKEN
  echo
  doctl auth init --access-token "$DO_TOKEN"
fi

print_success "Authenticated with DigitalOcean"

# ---------------------------------------------------------------------------
# Collect Google OAuth credentials
# ---------------------------------------------------------------------------
print_step "Collecting Google OAuth credentials..."
echo "  (Create these at https://console.cloud.google.com/apis/credentials)"
echo ""

read -p "Google Client ID: " GOOGLE_CLIENT_ID
if [[ -z "$GOOGLE_CLIENT_ID" ]]; then
  print_error "Google Client ID is required."
  exit 1
fi

read -sp "Google Client Secret: " GOOGLE_CLIENT_SECRET
echo
if [[ -z "$GOOGLE_CLIENT_SECRET" ]]; then
  print_error "Google Client Secret is required."
  exit 1
fi

# Generate a NextAuth secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)
print_success "Generated NEXTAUTH_SECRET"

# ---------------------------------------------------------------------------
# Ensure code is pushed to GitHub
# ---------------------------------------------------------------------------
print_step "Checking GitHub repo..."

if git remote get-url origin &> /dev/null; then
  GITHUB_REPO=$(git remote get-url origin)
  print_success "Found GitHub remote: ${GITHUB_REPO}"
else
  print_warn "No GitHub remote found. Let's set one up."
  read -p "GitHub repo name (e.g., dinnertime-app): " REPO_NAME
  REPO_NAME="${REPO_NAME:-dinnertime-app}"

  if command -v gh &> /dev/null; then
    print_step "Creating GitHub repo via gh CLI..."
    gh repo create "$REPO_NAME" --private --source=. --push
    GITHUB_REPO=$(git remote get-url origin)
    print_success "Created and pushed to ${GITHUB_REPO}"
  else
    print_error "No git remote and gh CLI not installed."
    echo "  Please push your code to GitHub manually, then re-run this script."
    echo "  git remote add origin https://github.com/YOUR_USER/${REPO_NAME}.git"
    echo "  git push -u origin main"
    exit 1
  fi
fi

# Extract GitHub owner/repo for app spec
GITHUB_OWNER=$(echo "$GITHUB_REPO" | sed -E 's|.*github\.com[:/]([^/]+)/.*|\1|')
GITHUB_REPO_NAME=$(echo "$GITHUB_REPO" | sed -E 's|.*github\.com[:/][^/]+/([^.]+).*|\1|')
print_success "GitHub: ${GITHUB_OWNER}/${GITHUB_REPO_NAME}"

# ---------------------------------------------------------------------------
# Select region
# ---------------------------------------------------------------------------
print_step "Selecting deployment region..."
echo "  Available regions: nyc1, nyc3, sfo3, tor1, lon1, ams3, fra1, sgp1, blr1, syd1"
read -p "Region [${REGION}]: " INPUT_REGION
REGION="${INPUT_REGION:-$REGION}"
print_success "Region: ${REGION}"

# ---------------------------------------------------------------------------
# Create PostgreSQL Database
# ---------------------------------------------------------------------------
print_step "Creating managed PostgreSQL database..."
echo "  Name: ${DB_NAME} | Size: ${DB_SIZE} | Region: ${REGION}"

# Check if database already exists
if doctl databases list --format Name --no-header | grep -q "^${DB_NAME}$"; then
  print_warn "Database '${DB_NAME}' already exists. Using existing database."
  DB_ID=$(doctl databases list --format ID,Name --no-header | grep "${DB_NAME}" | awk '{print $1}')
else
  DB_ID=$(doctl databases create "${DB_NAME}" \
    --engine "${DB_ENGINE}" \
    --version "${DB_VERSION}" \
    --size "${DB_SIZE}" \
    --region "${REGION}" \
    --num-nodes "${DB_NUM_NODES}" \
    --format ID --no-header)
  print_success "Database cluster created: ${DB_ID}"

  echo "  Waiting for database to come online (this takes 2-4 minutes)..."
  while true; do
    STATUS=$(doctl databases get "${DB_ID}" --format Status --no-header)
    if [[ "$STATUS" == "online" ]]; then
      break
    fi
    echo "    Status: ${STATUS} — waiting 15s..."
    sleep 15
  done
  print_success "Database is online!"
fi

# Create the application database
print_step "Creating 'dinnertime' database on the cluster..."
doctl databases db create "${DB_ID}" "dinnertime" 2>/dev/null || print_warn "Database 'dinnertime' may already exist, continuing..."

# Get the connection string
DB_HOST=$(doctl databases get "${DB_ID}" --format Host --no-header)
DB_PORT=$(doctl databases get "${DB_ID}" --format Port --no-header)
DB_USER=$(doctl databases get "${DB_ID}" --format User --no-header)
DB_PASSWORD=$(doctl databases get "${DB_ID}" --format Password --no-header)

DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/dinnertime?sslmode=require"
print_success "Database connection string ready"

# ---------------------------------------------------------------------------
# Create the App Platform app spec
# ---------------------------------------------------------------------------
print_step "Generating App Platform spec..."

APP_SPEC_FILE=$(mktemp /tmp/dinnertime-app-spec.XXXXXX.yaml)

cat > "${APP_SPEC_FILE}" << APPSPEC
name: ${APP_NAME}
region: ${REGION}
services:
  - name: web
    github:
      repo: ${GITHUB_OWNER}/${GITHUB_REPO_NAME}
      branch: main
      deploy_on_push: true
    dockerfile_path: Dockerfile
    http_port: 3000
    instance_count: 1
    instance_size_slug: basic-xxs
    routes:
      - path: /
    health_check:
      http_path: /api/auth/session
      initial_delay_seconds: 30
      period_seconds: 30
    envs:
      - key: DATABASE_URL
        value: "${DATABASE_URL}"
        type: SECRET
      - key: NEXTAUTH_URL
        value: \${APP_URL}
        type: GENERAL
      - key: NEXTAUTH_SECRET
        value: "${NEXTAUTH_SECRET}"
        type: SECRET
      - key: GOOGLE_CLIENT_ID
        value: "${GOOGLE_CLIENT_ID}"
        type: SECRET
      - key: GOOGLE_CLIENT_SECRET
        value: "${GOOGLE_CLIENT_SECRET}"
        type: SECRET
      - key: NODE_ENV
        value: "production"
        type: GENERAL
      - key: PORT
        value: "3000"
        type: GENERAL
APPSPEC

print_success "App spec written to ${APP_SPEC_FILE}"

# ---------------------------------------------------------------------------
# Deploy the app
# ---------------------------------------------------------------------------
print_step "Creating App Platform app..."

# Check if app already exists
EXISTING_APP_ID=$(doctl apps list --format ID,Spec.Name --no-header 2>/dev/null | grep "${APP_NAME}" | awk '{print $1}' || true)

if [[ -n "$EXISTING_APP_ID" ]]; then
  print_warn "App '${APP_NAME}' already exists (${EXISTING_APP_ID}). Updating..."
  doctl apps update "${EXISTING_APP_ID}" --spec "${APP_SPEC_FILE}"
  APP_ID="${EXISTING_APP_ID}"
else
  APP_ID=$(doctl apps create --spec "${APP_SPEC_FILE}" --format ID --no-header)
  print_success "App created: ${APP_ID}"
fi

# ---------------------------------------------------------------------------
# Wait for deployment
# ---------------------------------------------------------------------------
print_step "Deploying app (first build takes 3-6 minutes)..."

DEPLOY_ATTEMPTS=0
MAX_ATTEMPTS=40  # 40 * 15s = 10 minutes max

while [[ $DEPLOY_ATTEMPTS -lt $MAX_ATTEMPTS ]]; do
  PHASE=$(doctl apps get "${APP_ID}" --format ActiveDeployment.Phase --no-header 2>/dev/null || echo "UNKNOWN")

  case "$PHASE" in
    ACTIVE)
      print_success "Deployment successful!"
      break
      ;;
    ERROR|FAILED)
      print_error "Deployment failed. Check logs with:"
      echo "  doctl apps logs ${APP_ID} --type build"
      echo "  doctl apps logs ${APP_ID} --type run"
      rm -f "${APP_SPEC_FILE}"
      exit 1
      ;;
    *)
      echo "    Phase: ${PHASE} — waiting 15s... (${DEPLOY_ATTEMPTS}/${MAX_ATTEMPTS})"
      sleep 15
      ;;
  esac

  DEPLOY_ATTEMPTS=$((DEPLOY_ATTEMPTS + 1))
done

if [[ $DEPLOY_ATTEMPTS -ge $MAX_ATTEMPTS ]]; then
  print_warn "Deployment is still running. Check status with:"
  echo "  doctl apps get ${APP_ID}"
fi

# ---------------------------------------------------------------------------
# Get the live URL
# ---------------------------------------------------------------------------
APP_URL=$(doctl apps get "${APP_ID}" --format DefaultIngress --no-header 2>/dev/null || echo "pending...")
print_success "App URL: https://${APP_URL}"

# ---------------------------------------------------------------------------
# Run database migrations and seed
# ---------------------------------------------------------------------------
print_step "Running database migrations and seed..."
echo "  Note: This will run inside the app container via console."
echo ""
echo "  Since App Platform console requires manual access, run these commands"
echo "  in the DigitalOcean dashboard under your app's Console tab:"
echo ""
echo "    npx prisma db push"
echo "    npx tsx prisma/seed.ts"
echo ""
echo "  OR run them locally if you have PostgreSQL access:"
echo ""
echo "    DATABASE_URL=\"${DATABASE_URL}\" npx prisma db push"
echo "    DATABASE_URL=\"${DATABASE_URL}\" npx tsx prisma/seed.ts"

# ---------------------------------------------------------------------------
# Remind about Google OAuth redirect
# ---------------------------------------------------------------------------
print_step "IMPORTANT: Update Google OAuth redirect URIs"
echo ""
echo "  Go to https://console.cloud.google.com/apis/credentials"
echo "  Edit your OAuth 2.0 Client ID and add:"
echo ""
echo "  Authorized JavaScript origins:"
echo "    https://${APP_URL}"
echo ""
echo "  Authorized redirect URIs:"
echo "    https://${APP_URL}/api/auth/callback/google"
echo ""

# ---------------------------------------------------------------------------
# Add database to trusted sources
# ---------------------------------------------------------------------------
print_step "Adding app to database trusted sources..."
doctl databases firewalls append "${DB_ID}" --rule "app:${APP_ID}" 2>/dev/null || \
  print_warn "Could not auto-add firewall rule. Add your app to the database trusted sources manually in the DO dashboard."

# ---------------------------------------------------------------------------
# Cleanup
# ---------------------------------------------------------------------------
rm -f "${APP_SPEC_FILE}"

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo ""
echo "============================================================================"
echo -e "${GREEN}  DinnerTime deployed successfully!${NC}"
echo "============================================================================"
echo ""
echo "  App URL:      https://${APP_URL}"
echo "  App ID:       ${APP_ID}"
echo "  Database ID:  ${DB_ID}"
echo "  Region:       ${REGION}"
echo ""
echo "  Monthly cost: ~\$20/mo (App Basic \$5 + DB Basic \$15)"
echo ""
echo "  Next steps:"
echo "    1. Update Google OAuth redirect URIs (see above)"
echo "    2. Run database migrations (see above)"
echo "    3. Visit https://${APP_URL} and sign in with Google"
echo "    4. Create your family and start planning dinners!"
echo ""
echo "  Useful commands:"
echo "    doctl apps logs ${APP_ID} --type run    # View app logs"
echo "    doctl apps logs ${APP_ID} --type build  # View build logs"
echo "    doctl apps update ${APP_ID} --spec ...  # Update config"
echo "    doctl databases get ${DB_ID}            # Database info"
echo ""
echo "============================================================================"
