#!/usr/bin/env bash
# Build the backend and web images. IMAGE_PREFIX/IMAGE_TAG control the tags, e.g.
#   IMAGE_PREFIX=ghcr.io/acme/pakkaplay IMAGE_TAG=1.2.0 ci/docker.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PREFIX="${IMAGE_PREFIX:-pakkaplay}"
TAG="${IMAGE_TAG:-local}"
docker build -t "$PREFIX-backend:$TAG" "$ROOT/backend"
docker build -t "$PREFIX-web:$TAG" "$ROOT/web"
