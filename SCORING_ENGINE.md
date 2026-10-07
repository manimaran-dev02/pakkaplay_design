# Scoring engine (design, implemented in Phase 5)

The scoring engine is event-sourced (ADR-003, ADR-004, ADR-005). Scores are never edited
directly. Every change is an event, and the score is derived from the events.

## Flow of a scoring command

1. The scorer sends a command: `POST /api/v1/matches/{id}/events` with `type`,
   `expectedSequence` and `clientCommandId`.
2. The request is authorized. The caller needs `SCORE_CREATE` and must be assigned to the
   match.
3. The match row is locked (`SELECT … FOR UPDATE`). A stale `expectedSequence` returns
   409 `STALE_MATCH_STATE`. A repeated `clientCommandId` returns the original result.
4. The current `MatchState` is loaded from the snapshot in `scores` plus any later events.
5. The pure function `ScoringEngine.decide(state, command)` either returns events or
   rejects the command. Checks include the match state, players on the mat, and Kabaddi
   rules.
6. The events are appended to `match_events` and the projections are updated: score,
   mat state, and match statistics.
7. After commit, the update is published to `/topic/matches/{id}` together with its
   sequence number, and an audit record is written.

## Rules encoded (default PKL ruleset, configurable per tournament)

- 7 players on the mat, 12-player squad, 2 × 20-minute halves, 30 s raid clock.
- **Do-or-die:** the third raid after two consecutive empty raids by the same team. If it
  fails, the raider is out.
- **Bonus:** valid only with ≥ 6 defenders on the mat. Worth +1, with no player out.
- **Super raid:** ≥ 3 points in one raid.
- **Super tackle:** a successful tackle with ≤ 3 defenders. Worth +2 (1 + 1 bonus).
- **All-out:** when every player of a side is out, the other side gets +2 and the side is
  revived in full.
- **Revival:** each point scored revives one out player, in order of dismissal.
- **Technical point:** awarded by officials with a reason. Requires `SCORE_REVIEW`.

## Event types

`MATCH_STARTED`, `RAID_STARTED`, `SUCCESSFUL_RAID`, `UNSUCCESSFUL_RAID`, `EMPTY_RAID`,
`BONUS_POINT`, `SUPER_RAID`, `DO_OR_DIE_SUCCESS`, `DO_OR_DIE_FAILURE`, `TACKLE_SUCCESS`,
`SUPER_TACKLE`, `PLAYER_OUT`, `PLAYER_REVIVED`, `ALL_OUT`, `SUBSTITUTION`, `TIMEOUT`,
`REVIEW_REQUESTED`, `REVIEW_ACCEPTED`, `REVIEW_REJECTED`, `HALF_TIME`,
`SECOND_HALF_STARTED`, `TECHNICAL_POINT`, `EVENT_VOIDED`, `MATCH_COMPLETED`.

## Corrections

- **Undo:** an `EVENT_VOIDED` event that references the target sequence. The projection
  is recomputed by replay.
- **Review:** `REVIEW_ACCEPTED` can void events and append replacement events.
- Every correction carries an actor and a reason, and is auditable.

## Invariants (tested)

- Replaying all events of a match always produces the stored score.
- The score never changes without an event.
- Events whose state preconditions do not hold are rejected. For example, scoring is not
  accepted in `HALF_TIME`.
