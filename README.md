# Pakka Play

Pro Kabaddi sports platform: live scoring, tournaments, teams, players, statistics, live
scoreboards, a sports social feed, communities, nearby events and notifications.

| Part | Tech | Folder |
|------|------|--------|
| Backend (modular monolith) | Java 21, Spring Boot 3.5, PostgreSQL 16, Redis 7, Flyway | [`backend/`](backend) |
| Web app (admins, organizers, scorers) | Angular 22 | [`web/`](web) |
| Mobile app (players, fans, managers) | Flutter 3.47 | [`mobile/`](mobile) |
| UI/UX source of truth | Claude Design export | [`docs/design/`](docs/design) |

## Status

**Phase 1: foundation, done.** The backend boots with Flyway, Redis cache, OpenAPI,
consistent API errors and baseline security. The web and mobile shells talk to it. Docker
Compose and CI are in place. See [docs/implementation-plan.md](docs/implementation-plan.md)
for the roadmap.

> The UI design has not been imported yet (`docs/design/README.md`), so web and mobile
> screens use temporary layouts.

## Quick start

```bash
cp .env.example .env
docker compose up --build
```

- Web app: http://localhost:8081
- API: http://localhost:8080, Swagger UI: http://localhost:8080/swagger-ui.html
- Health: http://localhost:8080/actuator/health

For local development without containers, see [DEVELOPMENT.md](DEVELOPMENT.md).

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md): system structure and module boundaries
- [docs/architecture-decisions.md](docs/architecture-decisions.md): ADRs
- [API.md](API.md): API conventions and endpoints
- [DATABASE.md](DATABASE.md): schema and migrations
- [SCORING_ENGINE.md](SCORING_ENGINE.md): event-sourced live scoring design
- [DEVELOPMENT.md](DEVELOPMENT.md), [TESTING.md](TESTING.md), [DEPLOYMENT.md](DEPLOYMENT.md)
