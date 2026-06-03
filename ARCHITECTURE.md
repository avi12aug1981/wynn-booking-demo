# Architecture Overview

> **Canonical system architecture** (full stack, security, flows): [docs/Architecture.md](docs/Architecture.md)  
> **Backend detail** (MediatR, EF Core, inventory): [backend/docs/BACKEND-ARCHITECTURE.md](backend/docs/BACKEND-ARCHITECTURE.md)

## Purpose

Wynn Booking Demo is a hotel reservation proof of concept for senior .NET full-stack review: Next.js UI, **ASP.NET Core 9 Web API**, and **Azure SQL** (or SQL Server locally).

## Primary stack (v3 — use this in demos)

| Layer | Technology |
|-------|------------|
| UI | Next.js 16, React 19, TypeScript, Tailwind |
| API | ASP.NET Core 9, MediatR, FluentValidation, Swagger |
| Data | EF Core 9 → Azure SQL / SQL Server |
| Auth | JWT (demo members), API key on booking-session create |
| Email | MailKit SMTP (configured in `appsettings.Development.json`, gitignored) |

```text
Browser → Next.js (Page Gateway + features)
              ↓  lib/api/dotnet-booking-client.ts
         ASP.NET Core API (:5116)
              ↓  EF Core
         Azure SQL
```

Configure the UI with `NEXT_PUBLIC_BOOKING_API_URL` (see `.env.example`).

## Frontend layout

- **`app/`** — thin routing; catch-all `[[...segments]]` → Page Gateway.
- **`features/`** — `rooms`, `booking`, `confirmation`, `auth`, `reservations`.
- **`components/ui/`** — shared atoms / molecules / organisms.
- **`lib/api/dotnet-booking-client.ts`** — primary API client (envelope + JWT).

## Data model (SQL)

| Table | Role |
|-------|------|
| **Members** | Loyalty accounts (email, tier, status); login validates here |
| **Rooms** | Catalog |
| **BookingSessions** | Checkout tokens |
| **Bookings** | Confirmed stays (`MemberId` → `Members`) |
| **BookingGuests** | Guest lines |

## Request flow (current)

### Room search & details

```text
features/rooms → GET /api/rooms/search, /api/rooms/{id}/availability
              → GET /api/rooms/{id}/details (with booking session token)
```

### Booking session & checkout

```text
BookNowButton → POST /api/booking-sessions (x-api-key)
BookingPage   → GET session by token
BookingForm   → POST /api/bookings (guest: no JWT; member: Bearer token)
```

### Confirmation & reservations

```text
ConfirmationPage     → GET /api/bookings/{reference}
Reservation history  → GET /api/bookings/me (JWT)
Manage view          → GET /api/bookings/{reference}/manage (JWT)
Modify / cancel      → PUT / DELETE with JWT + rules
```

## Legacy: Prisma + SQLite

The repo still contains **`prisma/`**, **`lib/prisma`**, and some **Next.js API routes** from an earlier POC (SQLite via Prisma).

- **Not** the path used for the v3 interview demo.
- **Do not** describe the app as “Prisma + SQLite” in presentations — use **.NET API + EF Core + Azure SQL**.
- Safe one-liner if asked: *“Legacy local stack remains in the tree; production-style demo is .NET + SQL.”*

## Related docs

- [docs/README.md](docs/README.md) — documentation index + stack table
- [docs/TECHNICAL-DESIGN.md](docs/TECHNICAL-DESIGN.md)
- [docs/SECURITY.md](docs/SECURITY.md)
- [docs/API-REFERENCE.md](docs/API-REFERENCE.md)
- [docs/FolderStructure.md](docs/FolderStructure.md)
