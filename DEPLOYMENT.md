# Deployment

Phase 14 completes this guide. This page describes the current production template.

## Images

```bash
IMAGE_PREFIX=ghcr.io/<org>/pakkaplay IMAGE_TAG=<version> ci/docker.sh
docker push ghcr.io/<org>/pakkaplay-backend:<version>
docker push ghcr.io/<org>/pakkaplay-web:<version>
```

- Backend image: layered Spring Boot jar on `eclipse-temurin:21-jre-alpine`. Runs as a
  non-root user. The health check uses `/actuator/health/readiness`.
- Web image: the Angular production build on `nginx:1.29-alpine`. It proxies `/api`,
  `/ws` and `/actuator/health` to `backend:8080`.

## Run with the production template

```bash
# all variables are required; there are no defaults for secrets
export BACKEND_IMAGE=… WEB_IMAGE=… APP_VERSION=… \
       DB_NAME=… DB_USERNAME=… DB_PASSWORD=… REDIS_PASSWORD=… \
       CORS_ALLOWED_ORIGINS=https://app.example.com
docker compose -f docker-compose.prod.yml up -d
```

- PostgreSQL and Redis are not published to the host.
- Terminate TLS in front of the `web` service, with a load balancer or a reverse proxy
  such as nginx or Caddy holding the certificates.
- Flyway migrates the schema on backend startup. `flyway.clean` is disabled.
- Swagger UI and API docs are off in prod unless `API_DOCS_ENABLED=true`.
- Managed PostgreSQL or Redis: point `DB_URL`, `REDIS_HOST` and `REDIS_SSL` at them and
  remove those services from the compose file.

## Still to do (Phase 14)

Backups and restore runbook, Prometheus metrics endpoint, log shipping, JWT key
rotation, and a zero-downtime deploy strategy.
