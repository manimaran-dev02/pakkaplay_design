# Architecture

Decisions and their rationale are recorded in
[docs/architecture-decisions.md](docs/architecture-decisions.md). This page describes the
structure that results from them.

## System overview

```
 Flutter app ─┐                       ┌─ PostgreSQL 16 (source of truth, Flyway)
              ├─ HTTPS ─ nginx ─ REST ┤
 Angular app ─┘   (web)  └─ STOMP/WS ─┤─ Spring Boot backend (modular monolith)
                                      └─ Redis 7 (cache, live state, rate limits, WS relay)
```

In containers, nginx serves the Angular build and proxies `/api`, `/ws` and
`/actuator/health` to the backend. The browser therefore uses a single origin. The mobile
app calls the backend origin directly.

## Backend modules

Package `com.pakkaplay`. Each module is a bounded context:

| Module | Responsibility | Phase |
|--------|----------------|-------|
| `common` | Shared kernel: error model, base entity | 1 |
| `config`, `security` | Cross-cutting configuration, security filter chain | 1–2 |
| `identity` | Users, roles, permissions, auth tokens | 2 |
| `sports` | Players, teams, venues, tournaments | 3 |
| `match` | Matches, squads, officials, match state machine | 4 |
| `scoring` | Event-sourced scoring engine | 5 |
| `realtime` | STOMP publishing, live state cache | 6 |
| `statistics` | Player / team / tournament stats, rankings | 7 |
| `social` | Feed, posts, comments, likes, follows | 8 |
| `community` | Communities, membership, moderation | 9 |
| `events` | Nearby sports events, registration | 10 |
| `notification` | Notifications and delivery channels | 11 |
| `admin` | Administration, audit queries | 12 |

Inside a module, code is layered as `api/` (controllers, DTOs), then `application/`
(services, transactions), then `domain/` (entities, rules), then `infrastructure/`
(repositories, adapters).

These boundary rules are enforced by `ModuleBoundariesTest` (ArchUnit):

- `common` never depends on a module.
- A module never touches another module's `infrastructure`.
- Controllers (`api`) never use repositories directly.

## Web app (`web/`)

Angular 22 uses standalone components, zoneless change detection, signals for view state,
and RxJS for HTTP and streams.

- `core/`: app-wide singletons, such as HTTP interceptors (`errorInterceptor` normalizes
  failures to `ApiError`) and the system status service.
- `shared/`: reusable presentational components.
- `features/<name>/`: one lazy-loaded route tree per feature (`auth`, `dashboard`,
  `players`, `teams`, `tournaments`, `matches`, `live-scoring`, `statistics`, `social`,
  `communities`, `events`, `notifications`, `admin`, `users`).
- `layout/`: the app shell and navigation. It is temporary until the design is imported.

## Mobile app (`mobile/`)

Flutter with Riverpod, GoRouter, Dio and flutter_secure_storage.

- `core/config`: build-time config (`--dart-define=API_BASE_URL=…`).
- `core/network`: the Dio provider. All failures become `ApiException`.
- `core/auth`: `TokenStorage` (Keychain/Keystore).
- `core/router`: GoRouter with a bottom-navigation shell.
- `core/theme`: a temporary theme until the design tokens are available.
- `features/<name>/{data,domain,presentation}`, plus `shared/widgets`.
