# Availability Rules

## Principle

**Only confirmed bookings consume inventory.** A `BookingSession` does not reserve a room; two users can hold sessions for the same room/dates until one completes payment.

## Overlap Logic

A room is unavailable for requested `[checkIn, checkOut)` if any **confirmed** booking on that room overlaps:

```text
existing.CheckIn  < requestedCheckOut
AND
existing.CheckOut > requestedCheckIn
```

Cancelled bookings are excluded. Modify operations re-run overlap excluding the current booking ID.

## Where Validated

| Step | Behavior |
|------|----------|
| **Search** (`GET /api/rooms`) | Returns rooms with no overlapping confirmed booking for dates. |
| **Room availability** (`GET /api/rooms/{id}/availability`) | Explicit check before Book Now. |
| **Create booking** | Serializable isolation level + overlap check immediately before insert. |
| **Modify booking** | Re-validates overlap after date changes. |

## Concurrency

`CreateBooking` uses a **serializable** database transaction so two simultaneous confirms for the same room/dates cannot both succeed. Second request receives **409** with a room-not-available style message.

First commit wins — correct for hotel inventory without pessimistic session locks.

## Date Rules

- Check-in cannot be in the past (search and create).
- Check-out must be after check-in.
- **Cancel:** not allowed on or after check-in day (UTC).
- **Modify:** not allowed after check-in day has passed (allowed on check-in day).

Validators live in `StayDateValidationRules` (Application) and frontend `date` utils.

## Capacity & Pets

- Total guests (adult + child + infant) must not exceed `Room.MaxGuests`.
- Pets only if `Room.PetsAllowed`; max 2 pets when allowed.

## Frontend Alignment

- Search form syncs dates with URL query string.
- Stale search results refresh after booking completes (`markSearchResultsStale`).
- Room details require valid session token from Book Now flow.

## Interview Talking Points

- Why sessions don't lock inventory: avoids abandoned cart blocking revenue; trade-off is last-step race resolved by DB transaction.
- Alternative production patterns: optimistic locking, inventory holds with TTL, channel manager integration.

## Related

- [RELIABILITY.md](./RELIABILITY.md)
- [TECHNICAL-DESIGN.md](./TECHNICAL-DESIGN.md)
