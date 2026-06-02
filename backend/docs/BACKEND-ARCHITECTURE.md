# Wynn Booking API — Production Architecture

## Goals

- **Maintainability**: Vertical slices + MediatR; validation and logging in pipelines, not controllers.
- **Reliability**: Serializable booking transaction, EF SQL retry, structured errors with `traceId`.
- **Resilience**: Transient DB retries, rate limits on writes, non-blocking confirmation notifications.
- **Scalability**: Stateless API (scale App Service instances); SQL Server as system of record; session tokens are not inventory locks.

## Layering

```text
┌─────────────────────────────────────────────────────────┐
│  Wynn.Booking.Api                                       │
│  Controllers → ISender (MediatR)                        │
│  Middleware: CorrelationId, Exception, ApiKey            │
│  Health: /health/live, /health/ready, /api/health       │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  Wynn.Booking.Application                               │
│  Features/* (Commands/Queries + Handlers + Validators)  │
│  Behaviors: Logging → Performance → FluentValidation    │
│  Services: BookingService, RoomSearchService, …         │
│  Ports: IReservationConfirmationNotifier, …           │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  Wynn.Booking.Domain                                    │
│  Entities, enums, domain exceptions                     │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  Wynn.Booking.Infrastructure                            │
│  EF Core, repositories, SQL retry, notifier impl        │
└─────────────────────────────────────────────────────────┘
```

## Request pipeline (MediatR)

1. **LoggingBehavior** — request name in structured logs.
2. **PerformanceBehavior** — warns on requests &gt; 500 ms.
3. **ValidationBehavior** — FluentValidation; throws domain `ValidationException` → 400 JSON envelope.

Controllers only map HTTP ↔ MediatR; no business rules in the API project.

## Inventory model (critical business rule)

| Concept | Role |
|---------|------|
| `BookingSession` | Checkout state only (`BSN_*` token). Does **not** reserve inventory. |
| `Booking` (Confirmed) | Only hard inventory lock. |
| `CreateBooking` | `Serializable` transaction + overlap check before insert. |

First completed booking wins; concurrent submits get **409**.

## Security

| Mechanism | Scope |
|-----------|--------|
| `x-api-key` | `POST /api/booking-sessions` only (parity with Next.js BFF) |
| Rate limiting | `POST /api/bookings`, cancel |
| CORS | Configurable origins (`Cors:AllowedOrigins`) |
| Production | Swagger disabled; use `/api/health`, `/health/ready` |

Configure via `ApiSecurity` in appsettings or Azure App Settings. For production: **Entra ID JWT**, **Managed Identity → SQL**, **APIM**.

## Observability

- **Serilog** with `CorrelationId` (header `X-Correlation-Id`).
- **Health**: `GET /api/health` (app), `GET /health/ready` (DB), `GET /health/live` (process up).
- All API errors: `{ success, message, errors?, traceId }`.

## Notifications

`IReservationConfirmationNotifier` — booking succeeds even if notification fails (logged). Swap implementation for SendGrid / Azure Communication Services without changing `BookingService`.

## Configuration (Azure App Service)

| Setting | Example |
|---------|---------|
| `ConnectionStrings__BookingDatabase` | Azure SQL connection string |
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `ApiSecurity__InternalApiKey` | strong secret (not default) |
| `Cors__AllowedOrigins__0` | `https://your-frontend.azurewebsites.net` |

## Tests

```bash
cd backend
dotnet test
```

Integration tests use `WebApplicationFactory` against Development config (requires reachable SQL from `appsettings.Development.json`).

## Cancel and modify reservations

### Cancel — `POST /api/bookings/{referenceNumber}/cancel`

- **Confirmed** bookings only; already cancelled → 400.
- **Before check-in** (check-in date must be after today UTC).
- Sets `Status = Cancelled`, `PaymentStatus = Refunded`.
- Optional body: `{ "cancellationReason": "change of plans" }` (appended to special requests).
- Rate-limited (`booking-writes` policy).

### Modify — `PATCH /api/bookings/{referenceNumber}`

- **Confirmed** bookings only; at least one field required in body.
- **Before check-in** (same rule as cancel).
- Updatable: `checkInDate`, `checkOutDate`, `adultCount`, `childCount`, `infantCount`, `petCount`, `specialRequests`, `contactEmail`.
- Re-validates room capacity, pets, and **inventory** (overlap check excludes current booking).
- Recalculates `numberOfNights`, tax, and `totalPrice`.
- Serializable transaction on update.

Example modify body:

```json
{
  "checkInDate": "2026-07-01",
  "checkOutDate": "2026-07-04",
  "adultCount": 2,
  "specialRequests": "Late arrival after 10pm"
}
```

## Interview talking points

1. **Why MediatR?** Single responsibility per use case; cross-cutting in behaviors; controllers stay thin.
2. **Why not full CQRS split DB?** YAGNI for demo; read/write share model; search is EF query with overlap filter.
3. **Failure modes**: Validation → 400; conflict → 409; DB down → 503 health; email failure → booking still committed.
4. **Next steps at scale**: Read replica for search, Redis for session cache, outbox for email, JWT auth.
