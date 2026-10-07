-- Baseline: extensions used by later migrations.
-- gen_random_uuid() for UUID primary keys (ADR-009).
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- Case-insensitive text for emails / usernames (Phase 2).
CREATE EXTENSION IF NOT EXISTS citext;
