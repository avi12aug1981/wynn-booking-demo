# Architecture Overview

## Purpose

Wynn Booking Demo is a full-stack hotel reservation proof of concept for senior .NET full-stack interviews. It demonstrates luxury search, tokenized checkout, guest and member journeys, inventory rules, JWT authorization, and operational patterns suitable for Azure deployment.

## System Context

```text
┌──────────────┐     HTTPS (JSON)      ┌─────────────────────────┐
│   Browser    │ ◄──────────────────► │  Next.js 16 (port 3000) │
│              │                      │  Page Gateway + Features │
└──────────────┘                      └───────────┬─────────────┘
                                                  │
                                    NEXT_PUBLIC_BOOKING_API_URL
                                                  │
                                      ┌───────────▼─────────────┐
                                      │  ASP.NET Core 9 API     │
                                      │  (port 5116, Swagger)   │
                                      │  MediatR + EF Core        │
                                      └───────────┬─────────────┘
                                                  │
                                      ┌───────────▼─────────────┐
                                      │  Azure SQL / SQL Server │
                                      └─────────────────────────┘
```

The **primary booking path** is Next.js UI → `dotnet-booking-client` → .NET API → Azure SQL.

**Legacy (do not demo):** `prisma/`, SQLite, `lib/prisma/`, and some `app/api/*` routes from an earlier TypeScript/Prisma spike. See [README.md](./README.md) and [../ARCHITECTURE.md](../ARCHITECTURE.md).

## Technology Stack

| Layer | Technology |
|-------|------------|
| UI | Next.js 16, React 19, TypeScript, Tailwind CSS |
| API | ASP.NET Core 9, MediatR, FluentValidation, Serilog |
| Data | EF Core 9, Azure SQL (demo/prod), migrations + seed |
| Members | `Members` table (loyalty accounts); login validates against DB |
| Auth | JWT after `POST /api/auth/login`; API key on session create |
| Email | MailKit SMTP (optional, Gmail app password in dev) |

## Frontend Architecture

- **Page Gateway** (`app/[[...segments]]/page.tsx`) — single catch-all entry; routes registered in `features/app-router/page-gateway.tsx`.
- **Feature modules** — `rooms`, `booking`, `confirmation`, `auth`, `reservations` own pages and components.
- **Atomic UI** — `components/ui/atoms|molecules|organisms`.
- **API client** — `lib/api/dotnet-booking-client.ts` with envelope parsing and safe fetch when API is down.
- **Session** — `sessionStorage` for guest vs member mode and JWT (demo).

## Backend Architecture

Clean architecture with vertical slices:

- **Api** — controllers, middleware (correlation ID, exceptions, API key), JWT, rate limits, Swagger (non-production).
- **Application** — commands/queries, validators, `BookingService`, `RoomSearchService`, `BookingAuthorization`.
- **Domain** — entities, enums, domain exceptions.
- **Infrastructure** — EF repositories, SMTP notifier, email builder.

See [../backend/docs/BACKEND-ARCHITECTURE.md](../backend/docs/BACKEND-ARCHITECTURE.md) for pipeline and inventory details.

## Core Domain Concepts

| Concept | Description |
|---------|-------------|
| **Booking session** (`BSN_*` token) | Short-lived checkout context; does **not** hold inventory. |
| **Booking** (`WYNN-*` reference) | Confirmed reservation; only source of inventory lock. |
| **Guest booking** | `BookingType.Guest`, no `MemberId`; confirmation by reference URL. |
| **Member** | Row in `Members` (email, tier, status); seeded from `DemoAuth` on first API start. |
| **Member booking** | `BookingType.Member`, `MemberId` FK to `Members`; history/modify/cancel require sign-in. |

## Key User Flows

### Guest

```text
Login → Continue as Guest → Search → Room Details (/rooms/{id}/{token})
→ Booking (/booking/{token}) → Confirmation (/confirmation/{ref})
```

### Member

```text
Sign In (JWT) → Search → Book (locked profile) → Confirmation
→ My Reservations → View / Modify / Cancel
```

## Cross-Cutting Concerns

- **Messages** — `app/constants/messages.ts` (UI) and `ApplicationMessages.cs` (API).
- **Authorization** — `BookingAuthorization.cs` separates confirmation view vs manage vs modify/cancel.
- **Availability** — overlap query on confirmed bookings inside serializable create transaction.
- **Observability** — structured logs, `traceId` on API envelope, file logs under `backend/Wynn.Booking.Api/logs/`.

## Related Documents

- [README.md](./README.md) — documentation index
- [TECHNICAL-DESIGN.md](./TECHNICAL-DESIGN.md)
- [SECURITY.md](./SECURITY.md)
- [AVAILABILITY-RULES.md](./AVAILABILITY-RULES.md)
- [FolderStructure.md](./FolderStructure.md)
- [API-REFERENCE.md](./API-REFERENCE.md)
