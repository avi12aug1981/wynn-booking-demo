# Technical Design

**Stack:** Next.js 16 UI → ASP.NET Core 9 API → EF Core → Azure SQL. See [README.md](./README.md) and [Architecture.md](./Architecture.md).

## API Contract

All endpoints return a consistent envelope:

```json
{
  "success": true,
  "data": { },
  "message": null,
  "errors": null,
  "traceId": "abc123..."
}
```

Errors use HTTP status codes (400 validation, 401/403 auth, 404 not found, 409 conflict, 503 optional). Clients should surface `message` and log `traceId`.

## Endpoint Summary

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/login` | None | Demo member JWT |
| GET | `/api/rooms` | None | Search with dates + guest count |
| GET | `/api/rooms/{id}` | None | Room details; optional dates (both required if used) → **400** if invalid |
| GET | `/api/rooms/{id}/availability` | None | Boolean availability check |
| POST | `/api/booking-sessions` | `x-api-key` | Create checkout session |
| GET | `/api/booking-sessions/{token}` | None* | Load session + room |
| POST | `/api/bookings` | Optional JWT | Create booking (requires `bookingSessionToken`) |
| GET | `/api/bookings/{ref}` | Optional | Confirmation / public lookup by reference |
| GET | `/api/bookings/{ref}/manage` | JWT Member | Reservation detail for signed-in member |
| GET | `/api/bookings/me` | JWT Member | Reservation history list |
| PATCH | `/api/bookings/{ref}` | JWT Member | Modify stay/guests (not contact email on member bookings) |
| POST | `/api/bookings/{ref}/cancel` | JWT Member | Cancel before check-in day |
| GET | `/api/health` | None | App + DB health |

\* Session GET is public once token is known (capability URL).

**Webhook:** Not implemented in this demo. Production would add e.g. `POST /api/webhooks/payment` for PSP callbacks (Stripe/Adyen) to confirm payment before marking `PaymentStatus.Paid`. Document as future integration in interviews.

## Booking Create (POST `/api/bookings`)

**Required:** `bookingSessionToken`, room and guest fields, stay dates, address.

**Rules:**

1. Validate session active and not expired.
2. Session room/dates must align with request.
3. `BookingType.Member` → JWT required; `MemberId` only set for member type (not from ambient JWT on guest checkout).
4. Member contact email/name must match JWT claims.
5. Serializable transaction + overlap check → insert confirmed booking.
6. Mark session consumed; send confirmation email (non-blocking on failure).

## Authorization Matrix

| Action | Guest booking | Member booking |
|--------|---------------|----------------|
| View confirmation URL (anonymous) | Allowed | Allowed (email link) |
| View while signed-in as other user | Denied if email mismatch | Denied if wrong member |
| `/manage` + history | N/A | JWT + `MemberId` + type Member |
| History list | N/A | Also requires contact email = JWT email |
| Modify / cancel | Email match if guest | Member account + email match |

## Frontend Integration

- Env: `NEXT_PUBLIC_BOOKING_API_URL` (optional; default in `config/development.defaults.json`)
- Member calls send `Authorization: Bearer {token}` from `sessionStorage`.
- Guest booking POST omits JWT so `MemberId` is not stamped accidentally.
- Room details only via `/rooms/{roomId}/{sessionToken}`; bare `/rooms/{id}` redirects to search.

## Data Model (simplified)

- **Room** — catalog, capacity, pets, status.
- **BookingSession** — token, room, dates, guest count, expiry.
- **Member** — account (email, password hash for demo, tier, address, status).
- **Booking** — reference, type, `MemberId` FK, contact, pricing, status, payment.
- **BookingGuest** — guest lines on reservation.

## Configuration

| Area | Location |
|------|----------|
| DB | `ConnectionStrings:BookingDatabase` |
| JWT | `Jwt:*` |
| Demo users | `Members` table (seeded from `DemoAuth:Members` in Development) |
| API key | `ApiSecurity:InternalApiKey` |
| SMTP | `ReservationEmail:Smtp` + `FromAddress` (use `MailboxAddress.Parse` format) |
| CORS | `Cors:AllowedOrigins` |

## Sequence: Member Books a Room

```text
Client                    API                         DB
  | POST booking-sessions   |                           |
  |------------------------>| create BSN token          |
  |<------------------------|                           |
  | POST bookings + JWT     |                           |
  |------------------------>| validate session + auth   |
  |                         | serializable tx + overlap |
  |                         |------------------------->|
  |<------------------------| 201 + reference         |
  | GET bookings/{ref}      |                           |
  |------------------------>| confirmation payload    |
```

## Related

- [SECURITY.md](./SECURITY.md)
- [AVAILABILITY-RULES.md](./AVAILABILITY-RULES.md)
- [../backend/README.md](../backend/README.md)
