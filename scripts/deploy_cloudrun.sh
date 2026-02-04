#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID=${PROJECT_ID:-""}
REGION=${REGION:-"europe-north1"}
SERVICE=${SERVICE:-"nodi-chat"}
REPO=${REPO:-"nodi-chat"}
IMAGE_NAME=${IMAGE_NAME:-"nodi-chat"}
TAG=${TAG:-"latest"}
ALLOW_UNAUTH=${ALLOW_UNAUTH:-"true"}

if [[ -z "$PROJECT_ID" ]]; then
  echo "ERROR: Set PROJECT_ID env var. Example: PROJECT_ID=lisemark-ai-lab $0" >&2
  exit 1
fi

set -x

gcloud config set project "$PROJECT_ID"

gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com

if ! gcloud artifacts repositories describe "$REPO" --location "$REGION" >/dev/null 2>&1; then
  gcloud artifacts repositories create "$REPO" \
    --repository-format=docker \
    --location "$REGION" \
    --description "nodi-chat images"
fi

gcloud auth configure-docker "${REGION}-docker.pkg.dev" -q

IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/${IMAGE_NAME}:${TAG}"

docker buildx create --use --name nodi-chat-builder >/dev/null 2>&1 || true

docker buildx build \
  --platform linux/amd64 \
  -t "$IMAGE" \
  --push \
  .

AUTH_FLAG="--allow-unauthenticated"
if [[ "$ALLOW_UNAUTH" != "true" ]]; then
  AUTH_FLAG="--no-allow-unauthenticated"
fi

gcloud run deploy "$SERVICE" \
  --image "$IMAGE" \
  --region "$REGION" \
  $AUTH_FLAG \
  --port 8080 \
  --cpu 1 \
  --memory 512Mi \
  --min-instances 0 \
  --max-instances 3

gcloud run services describe "$SERVICE" --region "$REGION" --format='value(status.url)'
