# App Router / Page Gateway

Single catch-all entry: `app/[[...segments]]/page.tsx` delegates to `page-gateway.tsx` and `page-route-registry.ts`.

## Routes (v3)

| Path pattern | Feature |
|--------------|---------|
| `/`, `/login` | Auth |
| `/search` | Rooms search |
| `/rooms/{id}/{token}` | Room details (requires booking session token) |
| `/booking/{token}` | Checkout |
| `/confirmation/{ref}` | Confirmation |
| `/reservations`, `/reservations/{ref}` | Member history / manage |

## Data

All booking operations use **`lib/api/dotnet-booking-client.ts`** → ASP.NET Core API (not Prisma `app/api` routes).

See [../../docs/Architecture.md](../../docs/Architecture.md).
