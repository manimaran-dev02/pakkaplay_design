# Development

## Prerequisites

| Tool | Version |
|------|---------|
| JDK | 21 |
| Docker + Compose | recent (for infra and Testcontainers) |
| Node.js | ≥ 22.22.3 (24 LTS recommended), required by Angular 22 |
| Flutter | 3.47.x stable |

Maven is not needed. Use `backend/mvnw`.

## Run locally

```bash
cp .env.example .env
docker compose up -d postgres redis          # infrastructure only

# backend (dev profile is the default)
cd backend && set -a && . ../.env && set +a && ./mvnw spring-boot:run

# web: http://localhost:4200 (proxies /api, /ws, /actuator to :8080)
cd web && npm install && npm start

# mobile: Android emulator reaches the host at 10.0.2.2
cd mobile && flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8080
```

## Configuration

- Backend profiles: `dev` (default), `test`, `prod`. Values come from environment
  variables. See `.env.example` and `backend/src/main/resources/application*.yml`.
- Secrets are never committed. `.env` is gitignored, and the prod profile has no default
  secrets.

## Conventions

- Backend: put each change in the module that owns it (ARCHITECTURE.md). Use DTOs at the
  API boundary, throw `ApiException` for expected errors, and add every schema change as a
  new Flyway migration.
- Web: run `npm run lint`, `npm run format:check`, and `npx prettier --write` to fix
  formatting.
- Mobile: run `dart format lib test` and `flutter analyze`.
- Run the same checks as CI before pushing: `ci/backend.sh`, `ci/web.sh`, `ci/mobile.sh`.
