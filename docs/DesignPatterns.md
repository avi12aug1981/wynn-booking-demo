# Design Patterns

## Backend (.NET)

| Pattern | Where | Why |
|---------|-------|-----|
| **Clean architecture** | Api / Application / Domain / Infrastructure | Testability, swap EF or email without touching UI |
| **CQRS-style slices** | `Features/*` + MediatR | One handler per use case; validators colocated |
| **Pipeline behaviors** | Logging, validation, performance | Cross-cutting without controller bloat |
| **Repository** | `IBookingRepository`, `IBookingSessionRepository` | Hide EF from application services |
| **Strategy** | `IReservationConfirmationNotifier` | SMTP vs log vs SendGrid |
| **Domain exceptions** | `ConflictException`, `ValidationException` | Map to HTTP in middleware |
| **Options pattern** | `JwtOptions`, `ReservationEmailOptions` | Typed configuration |

## Frontend (Next.js)

| Pattern | Where | Why |
|---------|-------|-----|
| **Page Gateway** | `features/app-router` | Register routes in one place; features stay isolated |
| **Feature modules** | `features/rooms`, `booking`, etc. | Vertical ownership |
| **Atomic design** | `components/ui/atoms|molecules|organisms` | Reusable Wynn-styled UI |
| **Custom hooks** | `useDemoSession` | Centralize auth/session refresh |
| **BFF-style proxy** | `app/api/booking-sessions/...` | API key for session create from server route |
| **View model mapper** | `reservation-view-model.ts` | Single display shape for confirmation + manage |

## Domain Patterns

| Pattern | Description |
|---------|-------------|
| **Capability URL** | Booking session token + confirmation reference |
| **Optimistic concurrency** | Serializable TX instead of session inventory lock |
| **Fail-open notification** | Email failure does not rollback booking |
| **Authorization object** | `BookingAuthorization` static rules — single source of truth |

## Anti-Patterns Avoided

- Business logic in controllers
- Storing JWT member id on guest checkout
- Using query-string-only room URLs for checkout
- Requiring login on email confirmation links
- Putting full `"Name <email>"` string into MimeKit address constructor (use `Parse`)

## Related

- [Architecture.md](./Architecture.md)
- [../backend/docs/BACKEND-ARCHITECTURE.md](../backend/docs/BACKEND-ARCHITECTURE.md)
