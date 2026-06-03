# API Reference (Swagger Cheat Sheet)

**Base URL:** `http://localhost:5116`  
**Swagger:** `http://localhost:5116/swagger/index.html`

**Envelope:** `{ success, data?, message?, errors?, traceId? }`

**Demo auth:** `POST /api/auth/login` → `{ email, password }` → use `Authorization: Bearer {token}`

**API key (session create only):** header `x-api-key: wynn-demo-2026` (see `ApiSecurity:InternalApiKey`)

---

## Rooms

### GET `/api/rooms`

Search available rooms.

**Query:** `checkInDate`, `checkOutDate`, `guestCount` (required); optional `petsAllowed`, `nonSmoking`, `minRating`

**Explain:** Filters catalog + excludes rooms with overlapping **confirmed** bookings.

### GET `/api/rooms/{id}`

Room details for checkout UI.

**Query:** optional `checkInDate`, `checkOutDate` for pricing context

### GET `/api/rooms/{id}/availability`

Explicit availability check for one room and date range.

---

## Booking Sessions

### POST `/api/booking-sessions`

Starts checkout; returns `BSN_*` token.

**Headers:** `x-api-key` required  
**Body:** `{ roomId, checkInDate, checkOutDate, guestCount }`

**Explain:** Does not reserve inventory; short TTL.

### GET `/api/booking-sessions/{token}`

Loads session + room for booking page.

---

## Bookings

### POST `/api/bookings`

Creates confirmed reservation.

**Body highlights:** `bookingSessionToken`, `bookingType` (Guest/Member), guest/contact, dates, address, `guests[]`

**Auth:** Optional JWT — required logically for `Member` type; guest should omit JWT

**Explain:** Serializable TX + overlap; consumes session; triggers email.

### GET `/api/bookings/{referenceNumber}`

Confirmation / lookup. Anonymous allowed for email links (with auth rules for logged-in cross-access).

### GET `/api/bookings/{referenceNumber}/manage`

Member reservation detail for UI **My Reservations → View**. **JWT required.**

### GET `/api/bookings/me`

Member reservation list. **JWT required.** Filtered by member id + type + email match.

### PATCH `/api/bookings/{referenceNumber}`

Modify dates, guest counts, special requests. Member contact email not changed for member bookings.

### POST `/api/bookings/{referenceNumber}/cancel`

Cancel confirmed booking before check-in day.

**Body:** optional `{ cancellationReason }`

---

## Auth & Health

### POST `/api/auth/login`

Demo member credentials from `DemoAuth` in appsettings.

### GET `/api/health`

Application + database status for monitoring.

### GET `/health/ready` · GET `/health/live`

Kubernetes-style probes (see Program.cs).

---

## Webhook (Not Implemented)

**Planned:** `POST /api/webhooks/payment`

**Purpose:** Payment service provider notifies settlement; API idempotently marks booking paid and sends confirmation.

**Interview answer:** Demo simulates payment in UI; production wires webhook + signature validation + outbox.

---

## Quick Demo Swagger Order

1. `POST /api/auth/login`
2. `GET /api/rooms?checkInDate=2026-07-01&checkOutDate=2026-07-03&guestCount=2`
3. `POST /api/booking-sessions` (with API key)
4. `POST /api/bookings`
5. `GET /api/bookings/{ref}`
6. `GET /api/bookings/me` (with Bearer)
7. `POST /api/bookings/{ref}/cancel` (with Bearer)

---

## Related

- [TECHNICAL-DESIGN.md](./TECHNICAL-DESIGN.md)
- [../backend/README.md](../backend/README.md)
