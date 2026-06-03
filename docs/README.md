# Documentation Index

## V3 technology stack (canonical)

| Layer | Technology | Notes |
|-------|------------|--------|
| UI | Next.js 16, React 19, TypeScript, Tailwind | Page Gateway + feature modules |
| API client | `lib/api/dotnet-booking-client.ts` | Calls .NET API directly; JSON envelope + JWT |
| API | ASP.NET Core 9, MediatR, FluentValidation, Serilog | Swagger in non-Production |
| Data | EF Core 9 → Azure SQL / SQL Server | `Members`, `Rooms`, `Bookings`, … |
| Auth | JWT after login against **`Members`** table | Demo user: `demo.member@wynn.local` |
| Email | MailKit SMTP | `appsettings.Development.json` (gitignored) |

```text
Browser → Next.js → dotnet-booking-client → ASP.NET Core API → Azure SQL
```

**Not part of the v3 demo path:** `prisma/`, `lib/prisma/`, SQLite, and legacy `app/api/*` routes that still target the old Prisma stack.

## Start here

| Document | Audience |
|----------|----------|
| [Architecture.md](./Architecture.md) | Full system overview |
| [../ARCHITECTURE.md](../ARCHITECTURE.md) | Frontend flows + legacy note |
| [../backend/docs/BACKEND-ARCHITECTURE.md](../backend/docs/BACKEND-ARCHITECTURE.md) | .NET layers, MediatR, inventory |
| [TECHNICAL-DESIGN.md](./TECHNICAL-DESIGN.md) | Endpoints, auth matrix, sequences |
| [API-REFERENCE.md](./API-REFERENCE.md) | Swagger walkthrough |

## Operations & quality

| Document | Topic |
|----------|--------|
| [SECURITY.md](./SECURITY.md) | Auth, secrets, git hygiene |
| [AVAILABILITY-RULES.md](./AVAILABILITY-RULES.md) | Overlap, serializable TX |
| [RELIABILITY.md](./RELIABILITY.md) | Email non-blocking, traceId |
| [LOGGING.md](./LOGGING.md) | Unified UI → API → DB audit trail |
| [TESTING.md](./TESTING.md) | Integration tests + manual checklist |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Azure SQL + App Service + UI env |

## Reference

| Document | Topic |
|----------|--------|
| [DesignPatterns.md](./DesignPatterns.md) | Patterns in .NET + Next.js |
| [FolderStructure.md](./FolderStructure.md) | Repo map |
| [../config/README.md](../config/README.md) | Shared dev URLs (single source) |
| [../backend/README.md](../backend/README.md) | Run API, migrations, endpoints |
| [screenshots/README.md](./screenshots/README.md) | Deck captures (PNGs local only) |

## Local only (gitignored)

`INTERVIEW-QA.md`, `PRESENTATION.md`, `DEMO-SCRIPT.md` — interview prep; not pushed to the remote.
