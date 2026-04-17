# Homex API

Go + PostgreSQL + GORM skeleton for the mobile-first aircon technician finder and service CRM MVP.

## MVP Goals

- Public user discovery flow for finding technicians and submitting service requests
- Internal shop CRM for leads, quotations, jobs, schedule, technicians, and users
- Clear multi-tenant visibility rules by role:
  - `owner` / `admin`: full store access
  - `dispatcher`: full operational access inside the store
  - `technician`: only assigned leads, jobs, and user data for those assignments

## Folder Structure

```text
api/
├── cmd/server
├── internal/config
├── internal/database
├── internal/domain
├── internal/fixtures
├── internal/httpapi
└── migrations
```

## Database Convention

- Canonical PostgreSQL database name: `homex`
- Canonical local connection: `postgres://homex:homex@localhost:5433/homex?sslmode=disable`
- SQL files in `migrations/` are the source of truth for schema changes
- On boot, the API applies pending SQL migrations and records them in `schema_migrations`

## Current Identity Model

The schema now uses a central `users` table plus role-specific tables:

- `users`: canonical identity for both users and staff, split by `type`
- `user_identities`: LINE / Google / phone login identities for a user
- `store_memberships`: store-scoped role for a staff user
- `technician_profiles`: public/service profile for a technician membership
- `user_profiles`: store-scoped CRM profile for a user user
- `user_addresses`: reusable addresses for a user across jobs

This keeps auth/identity in one place while still allowing store-specific CRM data.

## Suggested Authentication Model

For MVP, keep authentication simple:

- User: phone OTP, LINE login, or Google login into `users`
- Staff: LINE login or Google login into `users`, then authorize via `store_memberships`
- Dev/demo mode in this scaffold:
  - role and visibility are simulated via headers
  - `X-Actor-Role`
  - `X-Store-ID`
  - `X-Technician-ID`
  - `X-User-ID`

## Key Endpoints

### Public user flow

- `GET /health`
- `GET /v1/public/technicians`
- `GET /v1/public/technicians/{slug}`
- `POST /v1/public/service-requests`
- `GET /v1/user/jobs`
- `GET /v1/user/jobs/{id}`

### Internal CRM flow

- `GET /v1/app/dashboard`
- `GET /v1/app/leads`
- `GET /v1/app/leads/{id}`
- `POST /v1/app/leads/{id}/assign`
- `POST /v1/app/leads/{id}/quotation`
- `POST /v1/app/leads/{id}/convert`
- `GET /v1/app/jobs`
- `GET /v1/app/jobs/{id}`
- `POST /v1/app/jobs/{id}/status`
- `GET /v1/app/schedule`
- `GET /v1/app/technicians`
- `GET /v1/app/users`

## Visibility Rules

- All internal records carry `store_id`
- User-facing records point back to `users.id` via `user_id`
- Technicians never query raw store-wide lists directly
- All list/detail queries must pass through actor scope
- If role is `technician`, filter by `assigned_technician_id = actor.technician_id`

The scaffold encodes that in `internal/domain/actor.go`.

## Next Steps

1. Replace fixture-backed handlers with repository-backed queries
2. Add auth middleware and token/session support
3. Add file upload storage for before/after job images
4. Add LINE Messaging API integration for lead ingestion and quotation delivery
