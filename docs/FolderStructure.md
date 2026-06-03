# Folder Structure

## Repository Root

```text
wynn-booking-demo/
├── app/                    # Next.js App Router (thin)
├── components/ui/          # Shared atomic UI
├── features/               # Domain features (main UI logic)
├── lib/                    # dotnet-booking-client (primary), legacy prisma/utils
├── docs/                   # Interview & architecture docs
├── backend/                # .NET solution
├── prisma/                 # Legacy/local schema (optional path)
├── README.md
└── ARCHITECTURE.md         # Entry point → docs/Architecture.md + frontend flows
```

## `app/`

```text
app/
├── [[...segments]]/page.tsx   # Catch-all → PageGateway
├── api/                       # Legacy Next routes (Prisma); v3 uses dotnet-booking-client
├── constants/                 # messages, routes, demo-user
├── hooks/                     # useDemoSession
├── globals.css
└── layout.tsx
```

## `features/`

```text
features/
├── app-router/           # page-gateway, route registry
├── auth/                 # LoginPage
├── rooms/                # search, room details, session
├── booking/              # BookingPage, BookingForm
├── confirmation/         # ConfirmationPage, print
└── reservations/         # history, manage, shared display
```

## `backend/`

```text
backend/
├── Wynn.Booking.Api/              # Host, controllers, middleware
├── Wynn.Booking.Application/      # Features, services, validators
├── Wynn.Booking.Domain/             # Entities, enums
├── Wynn.Booking.Infrastructure/   # EF, SMTP, repositories
├── Wynn.Booking.Api.IntegrationTests/
├── docs/                            # Azure SQL, deploy, backend arch
└── scripts/                         # provision-azure-sql, deploy
```

## `lib/` (v3)

```text
lib/
├── api/dotnet-booking-client.ts   # Primary — all booking UI calls to .NET API
├── api/booking-api-config.ts      # Base URL, API key header for session create
└── prisma/                        # Legacy — used only by old app/api routes
```

## Legacy folders (not v3 demo path)

| Path | Role |
|------|------|
| `prisma/` | SQLite schema + seed for old POC |
| `features/*/services/*-repository.ts` | Prisma repositories (unused by v3 UI pages) |
| `app/api/bookings`, `app/api/rooms`, … | Next.js API → Prisma |

## Key Files (Interview Pointers)

| File | Purpose |
|------|---------|
| `features/app-router/page-gateway.tsx` | Route table |
| `lib/api/dotnet-booking-client.ts` | All .NET API calls |
| `BookingService.cs` | Create/modify/cancel/list |
| `BookingAuthorization.cs` | Security rules |
| `MemberCredentialStore.cs` | Login against `Members` table |
| `BookingRepository.cs` | Overlap + persistence |
| `SmtpReservationConfirmationNotifier.cs` | Email send |
| `components/ui/organisms/AppTopBar.tsx` | Nav + auth UX |

## Documentation Index

```text
docs/
├── README.md              # Index + v3 stack table
├── Architecture.md
├── TECHNICAL-DESIGN.md
├── SECURITY.md
├── AVAILABILITY-RULES.md
├── RELIABILITY.md
├── TESTING.md
├── DEPLOYMENT.md
├── DesignPatterns.md
├── FolderStructure.md
├── API-REFERENCE.md
└── screenshots/          # README in repo; PNGs local only (gitignored)
```
