# Implementation Plan — Pro Kabaddi Sports Platform

Status: **DRAFT — awaiting approval before Phase 1**
Date: 2026-10-07

---

## 0. Current state

| Item | Finding |
|------|---------|
| Repository | Empty (no commits, no files) on branch `claude/pro-kabaddi-sports-platform-afy8dl` |
| `docs/design/` | **Not present / not imported.** The Claude Design project (`Kabaddi Vision Mobile.dc.html`, `support.js`) could not be fetched: design-sync needs `/design-login`, which can't run in this headless session. See `docs/design/README.md`. |
| Existing code to reuse | None |

**Consequence:** This plan is derived from the technical specification only.
All UI-specific items (screen list, navigation, design tokens, component
inventory) are marked **[DESIGN-PENDING]** and will be finalized in a short
"Phase 0.5 — Design analysis" step once the design files are in `docs/design/`.
No UI code will be written before that step.

The design file name ("Kabaddi Vision **Mobile**") suggests the design covers
the mobile app primarily; web/admin screens may need to be derived from it
(see contradictions §6).

---

## 1. Proposed repository structure

```
pakkaplay_design/
├── README.md
├── ARCHITECTURE.md  API.md  DATABASE.md  SCORING_ENGINE.md
├── DEPLOYMENT.md    DEVELOPMENT.md  TESTING.md
├── docker-compose.yml          # dev: postgres, redis, backend, web
├── docker-compose.prod.yml     # prod template (+ nginx)
├── .env.example
├── .github/workflows/
│   ├── backend.yml  web.yml  mobile.yml  docker.yml
├── ci/                          # shell scripts called by CI → portable to GitLab
│   ├── backend.sh  web.sh  mobile.sh  docker.sh
├── docs/
│   ├── design/                  # imported design = UI source of truth
│   ├── implementation-plan.md
│   └── architecture-decisions.md
├── backend/                     # Spring Boot 3.x, Java 21, Maven
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/java/com/pakkaplay/
│       ├── PakkaPlayApplication.java
│       ├── common/              # errors, ApiError, BaseEntity, paging, audit, utils
│       ├── config/              # OpenAPI, Redis, Cache, WebSocket, Jackson
│       ├── security/            # SecurityConfig, JwtService, JwtAuthenticationFilter,
│       │                        # permission evaluator, rate limiting
│       ├── identity/            # users, roles, permissions, auth, refresh tokens
│       ├── sports/              # players, teams, venues, tournaments (master data)
│       ├── match/               # matches, lineups, officials, state machine
│       ├── scoring/             # event model, rules engine, projections (score/state)
│       ├── statistics/          # player/team/tournament stats + rankings
│       ├── realtime/            # STOMP publishing, live state cache
│       ├── social/              # posts, comments, likes, shares, follows, hashtags
│       ├── community/           # communities, members, moderation
│       ├── events/              # sports events, registrations
│       ├── notification/        # notifications + channel abstraction
│       └── admin/               # admin endpoints, audit log queries
│       src/main/resources/
│       ├── application.yml  application-dev.yml  application-test.yml  application-prod.yml
│       └── db/migration/V1__...sql
├── web/                         # Angular (latest stable, standalone components)
│   ├── Dockerfile  nginx.conf
│   └── src/app/
│       ├── core/                # auth service, interceptors, guards, api clients, ws client
│       ├── shared/              # design-system components, pipes, directives
│       └── features/            # auth, dashboard, users, players, teams, tournaments,
│                                # matches, live-scoring, statistics, social,
│                                # communities, events, notifications, admin
└── mobile/                      # Flutter
    └── lib/
        ├── main.dart
        ├── core/  (config/, network/, auth/, router/, theme/)
        ├── shared/widgets/
        └── features/ (home, matches, live_score, players, teams, tournaments,
                       statistics, social, communities, events, notifications, profile)
            └── <feature>/{data, domain, presentation}
```

Each backend module has `api/` (controllers + DTOs), `application/` (services),
`domain/` (entities, domain logic), `infrastructure/` (repositories, adapters).
Modules talk to each other only through application services / Spring
application events — never by reaching into another module's repositories.
ArchUnit tests enforce this.

---

## 2. Phases (incremental, each ends with the Definition of Done checklist)

### Phase 0.5 — Design analysis [DESIGN-PENDING, blocks UI work]
- Import design into `docs/design/`.
- Produce `design-system.md` (tokens), `screens.md` (inventory + nav map), `flows.md` (per role).
- Map each screen → API endpoints → phase. Update this plan.

### Phase 1 — Foundation
- Monorepo skeleton (above). Backend boots with Actuator health, Flyway V1 (extensions only: `pgcrypto`), OpenAPI UI, global error handler, profiles.
- Angular app shell (routing, lazy feature stubs, interceptor stubs, theme from design tokens once available).
- Flutter app shell (Riverpod, GoRouter, Dio, flutter_secure_storage, theme).
- docker-compose: postgres 16, redis 7, backend, web (nginx).
- CI: backend build+test, web lint+test+build, flutter analyze+test (+ apk build on main), Docker build, dependency scanning.
- **Exit:** `docker compose up` gives a healthy stack; CI green.

### Phase 2 — Authentication & authorization
- Tables: `users, roles, permissions, user_roles, role_permissions, refresh_tokens, password_reset_tokens, email_verification_tokens, audit_logs`.
- Seed 8 roles and permission matrix via Flyway (see ADR-007).
- Register / login / logout / refresh (rotation + reuse detection) / forgot / reset / change password / email-verification architecture (`EmailSender` interface; dev impl logs the link).
- BCrypt (via `DelegatingPasswordEncoder`). Login rate limiting via Redis.
- Web + mobile: login, register, forgot/reset screens; token storage; refresh interceptor; route guards.

### Phase 3 — Sports master data
- `players, player_positions, player_team_history, teams, team_players, venues, tournaments, tournament_teams`.
- CRUD APIs with paging/filter/sort, validation, permission checks; resource ownership rules (e.g. TEAM_MANAGER edits only own team).
- UI: list/detail/form screens per design.

### Phase 4 — Match management
- `matches, match_teams, match_players, match_officials`.
- Create match (tournament, venue, teams, schedule), squad selection (12 squad / 7 on mat), officials (umpires, scorers).
- `MatchStateMachine`: SCHEDULED → READY → LIVE → HALF_TIME → SECOND_HALF → COMPLETED; SUSPENDED / POSTPONED / CANCELLED with explicit allowed transitions; every transition audited.

### Phase 5 — Live scoring engine (core)
- Append-only `match_events` (+ typed detail tables `raids, tackles, bonuses, substitutions, timeouts, reviews`).
- Pure, deterministic `ScoringEngine`: `(MatchState, Command) → (List<Event>, MatchState)`; validates rules (raider on mat, defenders on mat, do-or-die after two empty raids, super tackle when ≤3 defenders, all-out + 2 pts, revival order, bonus line only with ≥6 defenders, etc.).
- Score/mat state are projections derived by replaying events; `scores` table is a cached snapshot with `last_event_seq`.
- Undo = compensating `EVENT_VOIDED` event (never delete). Reviews may void/replace events.
- Optimistic concurrency via `expected_sequence` on each command; idempotency key per command.
- Extensive unit tests per rule.

### Phase 6 — Realtime
- STOMP over WebSocket (`/ws`), JWT on CONNECT. Topics: `/topic/matches/{id}/score`, `/topic/matches/{id}/events`, `/topic/matches/live`.
- Publish **after commit** (`@TransactionalEventListener(AFTER_COMMIT)`). Redis pub/sub relay for multi-instance readiness. Live state cached in Redis.
- Clients: snapshot via REST + subscribe; resync on sequence gap.
- Web + mobile live scoreboard, Angular scorer console.

### Phase 7 — Statistics
- `player_match_statistics, player_tournament_statistics, team_match_statistics, team_tournament_statistics`.
- Match-level stats updated synchronously in the scoring transaction; tournament/career aggregates recomputed on match completion (and rebuildable from events via admin job). Rankings/points table. Redis cache.

### Phase 8 — Social
- `social_posts, post_media, post_comments, post_likes, post_shares, user_followers, follows (polymorphic target: USER/PLAYER/TEAM/TOURNAMENT), hashtags, post_hashtags`.
- Feed = fan-out-on-read (query by followed targets) initially. Media via `StorageService` interface (local disk dev, S3-compatible prod); video = upload architecture only.

### Phase 9 — Communities
- `communities, community_members (role: OWNER/MODERATOR/MEMBER), community_posts`, announcements, moderation (remove post, ban member).

### Phase 10 — Sports events
- `sports_events, event_participants`; registration with capacity; nearby search (lat/lng + haversine query; PostGIS optional later).

### Phase 11 — Notifications
- `notifications` + `NotificationChannel` interface (IN_APP via STOMP `/user/queue/notifications` now; PUSH/EMAIL later). Triggered by domain events.

### Phase 12 — Admin
- User/role management, audit log viewer, content moderation, match corrections (event-based).

### Phase 13 — Testing & security hardening
- Coverage review, Testcontainers integration suites, WebSocket tests, OWASP dependency-check, security headers, CORS, rate limits, pen-test checklist.

### Phase 14 — Production deployment
- Prod compose/nginx TLS template, backups, observability (Actuator + Micrometer/Prometheus), runbook in DEPLOYMENT.md.

---

## 3. Delivery split: web vs mobile

| Area | Angular (web) | Flutter (mobile) |
|------|---------------|------------------|
| Auth, profile | ✅ | ✅ |
| Players/teams/tournaments browse | ✅ | ✅ |
| Players/teams/tournaments manage | ✅ | Team manager subset |
| Match setup, officials | ✅ | — |
| Live scorer console | ✅ (tablet-first) | ⚠️ decision D-4 |
| Live scoreboard viewing | ✅ | ✅ |
| Statistics | ✅ | ✅ |
| Social feed, communities, events | ✅ | ✅ (primary) |
| Notifications | ✅ | ✅ |
| Admin | ✅ | — |

---

## 4. Testing strategy (summary — full detail in TESTING.md in Phase 1)
- Scoring engine: pure JUnit tests, one per rule + replay/property tests (replaying events always yields the same score).
- Services: Mockito unit tests.
- Repositories/migrations/APIs/security: `@SpringBootTest` + Testcontainers (Postgres, Redis).
- WebSocket: STOMP client integration test.
- Angular: Jest/Karma unit tests for services, guards, key components.
- Flutter: unit + widget tests for providers and key widgets.

---

## 5. Assumptions

1. **A-1** Rules follow current PKL rules: 7 players on mat, 12-man squad, 2 × 20 min halves, 30 s raid clock, do-or-die after 2 consecutive empty raids by a team, super tackle at ≤3 defenders (+1 bonus), all-out +2, bonus line valid with ≥6 defenders, super raid = ≥3 points in one raid, revival in order of dismissal. Rules are parameterized per tournament (`ruleset` JSON) so local tournaments can differ.
2. **A-2** Single sport (Kabaddi) for scoring; `sports_events.sport` is free-form/enum so other sports can be listed as events.
3. **A-3** One user may have multiple roles; a PLAYER user links to one `players` record.
4. **A-4** Scoped roles: TEAM_MANAGER is scoped to their teams, TOURNAMENT_ORGANIZER to their tournaments, SCORER/UMPIRE to matches they're assigned to. Implemented via resource-level checks in the central authorization service, not only global permissions.
5. **A-5** Draws are possible in league matches; tie-breakers (golden raid) supported as a ruleset option, not in initial scope.
6. **A-6** Timer is server-authoritative (start timestamp + paused durations); clients render a local countdown.
7. **A-7** English only initially; i18n hooks (Angular i18n / Flutter intl) set up but not translated.
8. **A-8** Media storage: local filesystem in dev, S3-compatible in prod.
9. **A-9** Email sending: logged in dev; SMTP adapter config in prod.
10. **A-10** Package/group id `com.pakkaplay`; app display name "Pro Kabaddi Sports Platform" (to be reconciled with design branding — see C-1).

---

## 6. Contradictions / open points between design and spec

Since the design could not be read, these are **potential** conflicts to verify in Phase 0.5:

- **C-1 Branding:** design project is "Kabaddi Vision", repo is "pakkaplay", spec says "Pro Kabaddi Sports Platform". Need one product name.
- **C-2 Mobile-only design:** design file is a *mobile* design; spec requires a responsive Angular web app (admin, organizer, scorer). Web layouts would be derived from mobile design + Angular Material unless desktop designs exist.
- **C-3 Scorer device:** spec puts scorers on web; a mobile design may include a scorer screen intended for phones.
- **C-4 Angular Material vs custom design system:** if the design's visual language diverges strongly from Material, we'd use CDK + custom components instead of Material components.
- **C-5 `design-system.md`:** spec references `docs/design/design-system.md`, which doesn't exist in the design project (it has `.dc.html` + `support.js`). It will be extracted by us.

---

## 7. Decisions requiring your approval

| # | Decision | Recommendation |
|---|----------|----------------|
| **D-1** | **Design import** — how do you want to provide the design files? | Use Claude Design "Send to Claude Code Web", or commit the exported files into `docs/design/`. *Blocks UI work, not backend Phase 1.* |
| D-2 | Product name / branding (C-1) | Decide one name; used for package names, app ids, titles. |
| D-3 | Monorepo with `backend/`, `web/`, `mobile/` | Yes (single repo, path-filtered CI). |
| D-4 | Live scorer UI on Flutter too? | Web (tablet-first) only initially; add to Flutter later if the design includes it. |
| D-5 | CI platform | GitHub Actions now, with logic in `ci/*.sh` for easy GitLab port. |
| D-6 | Angular version / style | Latest stable (v20.x), standalone components, signals for local state, RxJS for streams. |
| D-7 | Undo semantics | Compensating `EVENT_VOIDED` events; only last N events undoable by scorer, older corrections via review/admin. |
| D-8 | Feed strategy | Fan-out-on-read in Postgres; revisit at scale. |
| D-9 | Nearby events geo search | Plain lat/lng + bounding box/haversine; PostGIS only if needed. |
| D-10 | Proceed with **Phase 1 backend/infra** while design import is pending? | Yes — Phase 1 is UI-agnostic except theme tokens, which will be stubbed. |

---

## 8. Next step

On approval: execute Phase 1 and stop for review at its exit criteria.
