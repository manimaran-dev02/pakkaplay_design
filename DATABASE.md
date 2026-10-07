# Database

PostgreSQL 16 is the source of truth. Redis holds only caches and other data that can be
rebuilt (ADR-010).

## Migrations

- Flyway scripts live in `backend/src/main/resources/db/migration`, named `V<n>__<description>.sql`.
- Hibernate runs with `ddl-auto=validate`, so the schema changes only through Flyway.
- Never edit a migration that has been merged. Add a new one instead.
- `flyway.clean` is disabled in prod.

| Version | Content |
|---------|---------|
| V1 | Extensions: `pgcrypto` (`gen_random_uuid()`), `citext` |

## Conventions (ADR-009)

- Primary keys are `uuid` with `DEFAULT gen_random_uuid()`.
- Mutable tables have `created_at timestamptz`, `updated_at timestamptz` and
  `version bigint` (optimistic locking). They map to `BaseEntity`.
- Timestamps are stored in UTC.
- Tables and columns use snake_case. Foreign keys are named `<entity>_id`.
- JSONB is used for flexible payloads (event details, tournament ruleset).
- `match_events` is append-only. Corrections are new events (ADR-004).

## Planned tables by phase

| Phase | Tables |
|-------|--------|
| 2 | users, roles, permissions, user_roles, role_permissions, refresh_tokens, password_reset_tokens, email_verification_tokens, audit_logs |
| 3 | players, player_positions, player_team_history, teams, team_players, venues, tournaments, tournament_teams |
| 4 | matches, match_teams, match_players, match_officials |
| 5 | match_events, raids, tackles, bonuses, substitutions, timeouts, reviews, scores |
| 7 | player_match_statistics, player_tournament_statistics, team_match_statistics, team_tournament_statistics |
| 8 | social_posts, post_media, post_comments, post_likes, post_shares, user_followers, follows, hashtags, post_hashtags |
| 9 | communities, community_members, community_posts |
| 10 | sports_events, event_participants |
| 11 | notifications |
