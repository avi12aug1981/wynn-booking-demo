# Reliability

Applies to the **ASP.NET Core 9** API and Next.js client integration (`dotnet-booking-client`). Legacy Prisma routes are out of scope.

## Design Goals

- Booking creation must be **consistent** under concurrency.
- Transient database failures should **retry** where safe.
- Confirmation email failure must **not** roll back a successful booking.
- API errors must be **actionable** (`message` + `traceId`).

## Database

- **EF Core retry** on transient SQL errors (Infrastructure registration).
- **Serializable** transaction for create booking — prevents double booking.
- **Health checks:** `/health/ready` (DB), `/health/live` (process), `/api/health` (envelope).

## Booking Pipeline Resilience

```text
Create booking
  ├─ Validate session (fail fast 400)
  ├─ Begin serializable transaction
  ├─ Overlap check
  ├─ Insert booking + guests
  ├─ Commit
  └─ Try confirmation email (failure → log warning, booking still 201)
```

`confirmationEmailSent` flag updated only when SMTP succeeds.

## API Error Handling

- `ExceptionHandlingMiddleware` — unhandled exceptions → 500 with envelope, no stack in response body.
- FluentValidation → 400 with field errors.
- Domain conflicts → 409.
- Auth failures → 401/403.

Clients (`dotnetFetch`) treat network failure as 503 with user-friendly message when API is stopped.

## Rate Limiting

Write endpoints (`POST /api/bookings`, cancel) use `booking-writes` policy to reduce abuse in demo deployments.

## Logging

- Serilog file sink: `backend/Wynn.Booking.Api/logs/wynn-booking-api-*.log`
- Request completion log includes `ApiTraceId` matching JSON `traceId`
- Long-running MediatR requests logged > 500 ms

## Frontend Resilience

- Safe fetch wrapper when .NET API unreachable (banners, confirmation unavailable state).
- Session refresh on route change (`useDemoSession`) after login/logout.
- Booking session errors redirect to login with `bookingError` query param.

## Failure Modes & Responses

| Failure | User impact | Mitigation |
|---------|-------------|------------|
| API down | Search/booking error message | Start API; check URL env |
| Session expired | Redirect to login | Start new search |
| Room taken | 409 / message on submit | Pick other dates/room |
| SMTP misconfigured | Booking succeeds; email pending | Fix `ReservationEmail` in Development.json |
| Invalid JWT | 401 on protected routes | Sign in again |

## Production Extensions

- Circuit breaker on SMTP
- Outbox pattern for email
- Azure Service Bus for async notifications
- Read replicas for search (CQRS)

## Related

- [AVAILABILITY-RULES.md](./AVAILABILITY-RULES.md)
- [TESTING.md](./TESTING.md)
