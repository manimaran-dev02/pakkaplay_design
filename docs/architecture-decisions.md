# Architecture Decision Records

Format: Context → Decision → Consequences. Status: **Proposed** until approved.

---

## ADR-001 Modular monolith
- **Context:** Many domains (scoring, social, community, events), one small team, early stage.
- **Decision:** Single Spring Boot deployable with package-per-module (`identity, sports, match, scoring, statistics, realtime, social, community, events, notification, admin`). Cross-module calls only via application services or Spring application events. Boundaries enforced with ArchUnit tests.
- **Consequences:** Simple deploy and transactions; modules can be extracted later if scale requires.

## ADR-002 Monorepo
- **Decision:** `backend/`, `web/`, `mobile/`, `docs/`, `ci/` in one repo; CI jobs path-filtered.
- **Consequences:** Atomic cross-stack changes; one place for API contract and docs.

## ADR-003 Event-sourced scoring, CRUD elsewhere
- **Context:** Scores must be auditable and never edited directly.
- **Decision:** `match_events` is an append-only log with per-match monotonically increasing `sequence`. A pure `ScoringEngine` validates commands against current `MatchState` and emits events. Score, mat state (players in/out), raid counters, and match stats are projections. `scores` stores a snapshot plus `last_event_seq`; it can always be rebuilt by replay. Only the scoring module uses event sourcing — other domains use plain JPA CRUD with audit logs.
- **Consequences:** Full audit trail, deterministic replay, easy undo/review. Slightly more complex writes; mitigated by snapshotting.

## ADR-004 Corrections via compensating events
- **Decision:** Undo/review never deletes. `EVENT_VOIDED(targetSeq, reason)` and `REVIEW_ACCEPTED` (with replacement events) are themselves events. Manual score adjustment = `TECHNICAL_POINT` / `SCORE_ADJUSTMENT` events requiring `SCORE_REVIEW` permission + reason.

## ADR-005 Concurrency & idempotency for scoring
- **Decision:** Each scoring command carries `expectedSequence` and `clientCommandId`. Server takes a row lock on the match (`SELECT … FOR UPDATE`) and rejects stale sequences with `409 STALE_MATCH_STATE`; duplicate `clientCommandId` returns the original result.
- **Consequences:** Safe with two scorers / flaky mobile networks.

## ADR-006 Realtime: STOMP, publish after commit
- **Decision:** Spring WebSocket + STOMP, simple broker initially, Redis pub/sub relay so multiple backend instances fan out. Publish via `@TransactionalEventListener(AFTER_COMMIT)`; payload includes `sequence` so clients detect gaps and re-fetch snapshot over REST. JWT validated on STOMP CONNECT; subscriptions to public match topics are allowed for anonymous viewers (configurable).

## ADR-007 Centralized RBAC + scoped authorization
- **Decision:** Roles and permissions live in DB (seeded via Flyway). JWT carries user id + roles; permissions resolved server-side (cached in Redis, invalidated on role change). Controllers use `@PreAuthorize("hasPermission(...)")` backed by one `PermissionEvaluator`/`AuthorizationService` that also checks resource scope (team manager → own team, scorer → assigned match, organizer → own tournament).
- **Default matrix (initial):**

| Role | Permissions |
|------|-------------|
| SUPER_ADMIN | all |
| ADMIN | all except managing SUPER_ADMIN |
| TOURNAMENT_ORGANIZER | *_VIEW, TOURNAMENT_CREATE/UPDATE, TEAM_CREATE/UPDATE, PLAYER_CREATE/UPDATE, MATCH_CREATE/UPDATE/START/END (scoped) |
| TEAM_MANAGER | *_VIEW, TEAM_UPDATE, PLAYER_CREATE/UPDATE (own team) |
| SCORER | *_VIEW, MATCH_START/END, SCORE_CREATE/UPDATE (assigned matches) |
| UMPIRE | *_VIEW, SCORE_REVIEW, MATCH_UPDATE (assigned matches) |
| PLAYER | *_VIEW, own profile update |
| USER | *_VIEW (public), social/community/events |

## ADR-008 JWT with rotating refresh tokens
- **Decision:** Short-lived access token (15 min, HS256 with secret from env; RS256-ready). Opaque refresh token (30 days) stored **hashed** in DB, rotated on every use; reuse of a revoked token revokes the whole token family. Web stores refresh token in an HttpOnly Secure SameSite cookie; mobile stores it in `flutter_secure_storage`. Logout revokes the family.

## ADR-009 Persistence
- **Decision:** PostgreSQL 16 is the source of truth; UUID PKs (`gen_random_uuid()`), `created_at/updated_at`, optimistic `version` columns, soft-delete only where needed (users, posts). Flyway owns schema; `ddl-auto=validate`. JSONB for flexible payloads (event details, tournament ruleset).

## ADR-010 Redis usage
- **Decision:** Spring Cache (stats, master data lookups), live match snapshot, permission cache, rate limiting (Bucket4j + Redis), WebSocket relay. Never the source of truth; everything rebuildable from Postgres.

## ADR-011 Statistics computation
- **Decision:** Match-level player/team stats updated in the same transaction as the scoring event (projections). Tournament/career aggregates recomputed on `MATCH_COMPLETED` and on voids affecting completed matches; full rebuild job available to admins.

## ADR-012 API conventions
- **Decision:** `/api/v1/**`, DTOs only (MapStruct), RFC-7807-style error body `{timestamp,status,code,message,path,errors[]}` from a single `@RestControllerAdvice`, cursor/page pagination, OpenAPI via springdoc.

## ADR-013 Frontend architecture
- **Web:** Angular standalone components, lazy-loaded feature routes, `core/` (singletons), `shared/` (presentational design-system components), functional guards/interceptors. Angular Material/CDK themed with design tokens (or CDK-only if the design diverges — see plan C-4).
- **Mobile:** Flutter feature-first clean architecture (`data/domain/presentation`), Riverpod, GoRouter, Dio with auth/refresh interceptor, `stomp_dart_client` for live score.

## ADR-014 Notifications via channel abstraction
- **Decision:** Domain events → `NotificationService` → persisted `notifications` → `NotificationChannel` implementations (IN_APP over STOMP now; FCM/APNs/email later) with per-user preferences.

## ADR-015 Media storage abstraction
- **Decision:** `StorageService` interface; local disk in dev, S3-compatible in prod; uploads via pre-signed URLs later. Video: metadata + upload path only, no transcoding in initial scope.

## ADR-016 CI portable across GitHub/GitLab
- **Decision:** Pipeline logic in `ci/*.sh`; GitHub Actions workflows are thin wrappers. A `.gitlab-ci.yml` can call the same scripts.
