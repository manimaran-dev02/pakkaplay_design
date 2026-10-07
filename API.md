# API

Interactive documentation is served by springdoc at `/swagger-ui.html` (dev; disabled in
prod unless `API_DOCS_ENABLED=true`). The OpenAPI JSON is at `/v3/api-docs`.

## Conventions (ADR-012)

- Every endpoint is versioned under `/api/v1`.
- Requests and responses use JSON DTOs. JPA entities are never exposed.
- Auth: `Authorization: Bearer <access token>` (Phase 2).
- Errors use a single shape, produced by `GlobalExceptionHandler` and, for 401/403 raised
  before a controller runs, by `ApiErrorSecurityHandler`:

```json
{
  "timestamp": "2026-10-07T15:43:31.640Z",
  "status": 400,
  "code": "VALIDATION_FAILED",
  "message": "The request is invalid.",
  "path": "/api/v1/teams",
  "errors": [{ "field": "name", "message": "must not be blank" }]
}
```

`errors` appears only for validation failures. Clients branch on `code`, never on
`message`. Internal exception details are never returned.

| Code | Status |
|------|--------|
| `VALIDATION_FAILED`, `MALFORMED_REQUEST` | 400 |
| `UNAUTHORIZED` | 401 |
| `FORBIDDEN` | 403 |
| `NOT_FOUND` | 404 |
| `METHOD_NOT_ALLOWED` | 405 |
| `CONFLICT` | 409 |
| `INTERNAL_ERROR` | 500 |

Domain codes such as `INVALID_MATCH_STATE` and `STALE_MATCH_STATE` are added with their
modules.

## Endpoints

| Method | Path | Auth | Phase |
|--------|------|------|-------|
| GET | `/actuator/health` (and `/liveness`, `/readiness`) | public | 1 ✅ |
| GET | `/actuator/info` | public | 1 ✅ |
| * | `/api/v1/auth/**` | mixed | 2 |
| * | `/api/v1/players`, `/teams`, `/tournaments`, `/venues` | ✔ | 3 |
| * | `/api/v1/matches/**` | ✔ | 4–5 |

The full planned list is in [docs/implementation-plan.md](docs/implementation-plan.md).
This table is updated as each phase lands.
