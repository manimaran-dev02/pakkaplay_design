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

## IntelliJ IDEA

1. **File → Open** and select the repository root (not `backend/`). When IntelliJ
   offers to *Load Maven project* for `backend/pom.xml`, accept. Otherwise right-click
   `backend/pom.xml` and choose **Add as Maven Project**.
2. **File → Project Structure → Project → SDK**: choose JDK 21.
3. Start the infrastructure: `cp .env.example .env && docker compose up -d postgres redis`.
4. Run the shared configuration **PakkaPlayApplication (dev)** from the run
   configurations dropdown. It lives in `.run/`. In Community Edition, run
   `PakkaPlayApplication.main()` instead. You don't need any environment variables,
   because the dev-profile defaults match `.env.example`.
5. Check http://localhost:8080/actuator/health and http://localhost:8080/swagger-ui.html.

Other ways to run things from IntelliJ:

- Tests: right-click `backend/src/test/java` and choose **Run 'All Tests'**. `*IT` tests
  need Docker running.
- Web: in Ultimate, open `web/package.json` and click ▶ next to `start`. Or run
  `npm start` in the terminal.
- Mobile: install the Flutter and Dart plugins, set the Flutter SDK path, and run
  `mobile/lib/main.dart`. Add `--dart-define=API_BASE_URL=http://10.0.2.2:8080` under
  *Additional run args*.

If Postgres reports `password authentication failed` after you change `DB_PASSWORD`:
Postgres sets the password only when its volume is first created. Recreate the volume
with `docker compose down -v` (this deletes local data).

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
