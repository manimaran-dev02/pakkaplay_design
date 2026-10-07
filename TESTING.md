# Testing

| Layer | Tooling | Location | Run |
|-------|---------|----------|-----|
| Backend unit | JUnit 5, Mockito, MockMvc (standalone) | `backend/src/test/**/*Test.java` | `./mvnw test` |
| Backend integration | Spring Boot Test + Testcontainers (PostgreSQL, Redis) | `backend/src/test/**/*IT.java` | `./mvnw verify` |
| Architecture | ArchUnit | `ModuleBoundariesTest` | `./mvnw test` |
| Web unit | Vitest via `ng test` | `web/src/**/*.spec.ts` | `npm run test:ci` |
| Mobile unit/widget | flutter_test | `mobile/test/` | `flutter test` |

Integration tests need a running Docker daemon. Containers start once per test JVM and
are shared through Spring's context cache.

## Current coverage (Phase 1)

- `ApplicationIT`: the app boots against real PostgreSQL and Redis. Checks that the
  Flyway baseline is applied, health is public and UP, OpenAPI is public, protected routes
  return the JSON 401, and the cache is backed by Redis.
- `GlobalExceptionHandlerTest`: covers the error contract, field errors, malformed JSON,
  and that internal messages never leak.
- `ModuleBoundariesTest`: covers the modular-monolith rules.
- Web: the error interceptor's normalization, the dashboard's online and offline states,
  and that every navigation target lazy-loads.
- Mobile: `ApiException` mapping, the home screen's online and offline states, and tab
  navigation.

## Planned per phase

Each phase adds tests from the spec: auth and authorization (Phase 2), CRUD (Phase 3),
match state transitions (Phase 4), and per-rule scoring-engine tests plus replay
invariants (Phase 5). WebSocket STOMP client tests come in Phase 6, statistics
recomputation in Phase 7, and security tests in Phase 13.
