# Homex API

Go + PostgreSQL + GORM skeleton for the mobile-first aircon technician finder and service CRM MVP.

## MVP Goals

- Public customer discovery flow for finding technicians and submitting service requests
- Internal shop CRM for leads, quotations, jobs, schedule, technicians, and customers
- Clear multi-tenant visibility rules by role:
  - `owner` / `admin`: full store access
  - `dispatcher`: full operational access inside the store
  - `technician`: only assigned leads, jobs, and customer data for those assignments

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

## Suggested Authentication Model

For MVP, keep authentication simple:

- Customer: phone OTP or LINE login
- Staff: password login or LINE login for store members
- Dev/demo mode in this scaffold:
  - role and visibility are simulated via headers
  - `X-Actor-Role`
  - `X-Store-ID`
  - `X-Technician-ID`
  - `X-Customer-ID`

## Key Endpoints

### Public customer flow

- `GET /health`
- `GET /v1/public/technicians`
- `GET /v1/public/technicians/{slug}`
- `POST /v1/public/service-requests`
- `GET /v1/customer/jobs`
- `GET /v1/customer/jobs/{id}`

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
- `GET /v1/app/customers`

## Visibility Rules

- All internal records carry `store_id`
- Technicians never query raw store-wide lists directly
- All list/detail queries must pass through actor scope
- If role is `technician`, filter by `assigned_technician_id = actor.technician_id`

The scaffold encodes that in `internal/domain/actor.go`.

## Next Steps

1. Replace fixture-backed handlers with repository-backed queries
2. Add auth middleware and token/session support
3. Add file upload storage for before/after job images
4. Add LINE Messaging API integration for lead ingestion and quotation delivery
