# Wynn Booking API (.NET 9)

ASP.NET Core Web API for the Wynn booking domain — **system of record** for the v3 demo (EF Core + Azure SQL). The Next.js app calls this API via `lib/api/dotnet-booking-client.ts`.

## Architecture

Production-oriented design: **MediatR** (CQRS-style features), **FluentValidation** pipeline, **API key** on session create, **EF retry**, **health probes**, **integration tests**.

See [docs/BACKEND-ARCHITECTURE.md](docs/BACKEND-ARCHITECTURE.md).

- **Wynn.Booking.Api** — HTTP, middleware, Swagger (non-Production)
- **Wynn.Booking.Application** — Features, behaviors, application services
- **Wynn.Booking.Domain** — entities, enums, domain exceptions
- **Wynn.Booking.Infrastructure** — EF Core, repositories, ports
- **Wynn.Booking.Api.IntegrationTests** — WebApplicationFactory tests

## Prerequisites

- .NET 9 SDK
- SQL Server — **Azure SQL** (recommended) or local Docker

### Azure SQL (create server + database)

The hostname in a bad connection string will not resolve in DNS. Create fresh resources first:

**Script:** see [docs/AZURE-SQL-SETUP.md](docs/AZURE-SQL-SETUP.md) or run:

```bash
az login
az account set --subscription "Azure subscription 1"
export WYNN_SQL_ADMIN_PASSWORD='YourStrong!Passw0rd'
chmod +x backend/scripts/provision-azure-sql.sh
./backend/scripts/provision-azure-sql.sh
```

Paste the printed connection string into `Wynn.Booking.Api/appsettings.Development.json`, then run migrations (below).

### SQL Server (Docker, local only)

```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourStrong@Passw0rd" \
  -p 1433:1433 --name wynn-sql -d mcr.microsoft.com/mssql/server:2022-latest
```

Copy `Wynn.Booking.Api/appsettings.Development.example.json` to `appsettings.Development.json` and set your Azure SQL (or local) connection string. That file is gitignored.

**Azure SQL** example:

```json
{
  "ConnectionStrings": {
    "BookingDatabase": "Server=tcp:YOUR_SERVER.database.windows.net,1433;Initial Catalog=YOUR_DB;User ID=YOUR_USER;Password=YOUR_PASSWORD;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
  }
}
```

Ensure the Azure firewall allows your client IP (Portal → SQL server → Networking).

## Run

```bash
cd backend/Wynn.Booking.Api
dotnet restore
dotnet run
```

- Swagger: http://localhost:5116/swagger
- Health: http://localhost:5116/api/health
- Room search: `GET /api/rooms?checkInDate=2026-06-01&checkOutDate=2026-06-03&guestCount=2`

## Authentication (JWT)

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/auth/login` | None — returns JWT |

**Demo member** (stored in **`Members`** table, seeded on startup from `DemoAuth` in appsettings):

- Email: `demo.member@wynn.local`
- Password: `demo.member`

Sign-in reads credentials from SQL, not config alone. Override seed via `DemoAuth:Members` in `appsettings.Development.json` and align `NEXT_PUBLIC_DEMO_MEMBER_*` in `.env`.

Use the token on protected routes:

```http
Authorization: Bearer <accessToken>
```

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/booking-sessions` | `x-api-key` (BFF / server) |
| POST | `/api/bookings` | **Requires `bookingSessionToken`**; optional JWT for member |
| GET | `/api/bookings/me` | JWT **Member** (reservation history) |
| GET | `/api/bookings/{ref}` | Confirmation lookup; email links work without login (auth rules when signed in) |
| GET | `/api/bookings/{ref}/manage` | JWT **Member** — My Reservations detail |
| PATCH | `/api/bookings/{ref}` | JWT **Member** |
| POST | `/api/bookings/{ref}/cancel` | JWT **Member** |

Configure `Jwt:SecretKey` (min 32 chars) in production via environment variable `Jwt__SecretKey`.

## Logs (file)

When the API runs, Serilog writes to:

`backend/Wynn.Booking.Api/logs/wynn-booking-api-YYYYMMDD.log`

On startup the API logs the **full absolute path** to this file.

Search using the **`traceId` from the JSON response** (same value as `ApiTraceId` in logs):

```bash
grep "ApiTraceId=YOUR_TRACE_ID_FROM_RESPONSE" backend/Wynn.Booking.Api/logs/wynn-booking-api-*.log
```

Every request also writes a completion line: `HTTP POST /api/Bookings -> 400 ApiTraceId=...`

Business failures (e.g. session mismatch) log: `API request failed. ApiTraceId=...`

## API endpoints (Next.js parity)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | DB connectivity + status |
| GET | `/api/rooms` | Search available rooms |
| GET | `/api/rooms/{id}/availability` | Single-room availability |
| POST | `/api/booking-sessions` | Start checkout session |
| GET | `/api/booking-sessions/{token}` | Load session + room |
| POST | `/api/bookings` | Create booking (Serializable transaction) |
| GET | `/api/rooms/{id}` | Room details |
| GET | `/api/bookings/{referenceNumber}` | Booking details (confirmation) |
| GET | `/api/bookings/{referenceNumber}/manage` | Member manage view |
| PATCH | `/api/bookings/{referenceNumber}` | Modify reservation (dates, guests, contact) |
| POST | `/api/bookings/{referenceNumber}/cancel` | Cancel reservation (before check-in) |

**Webhook:** not implemented — see [../docs/API-REFERENCE.md](../docs/API-REFERENCE.md).

All responses use the same envelope as the Next app: `{ success, data?, message?, errors?, traceId? }`.

## Migrations

Always run EF commands from the Api project with **Development** environment so `appsettings.Development.json` is loaded:

```bash
cd backend/Wynn.Booking.Api
export ASPNETCORE_ENVIRONMENT=Development
dotnet ef database update --project ../Wynn.Booking.Infrastructure
```

If you see `nodename nor servname provided, or not known`, DNS cannot resolve the SQL server hostname. In Azure Portal → your **SQL server** → Overview, copy the exact **Server name** (e.g. `myserver.database.windows.net`) and update `BookingDatabase` in `appsettings.Development.json`. A typo in the server name is the most common cause.

To verify DNS from your Mac:

```bash
nslookup YOUR_SERVER.database.windows.net
```

On first run, the API applies migrations and seeds rooms if the database is empty.

## Deploy to Azure App Service

See [docs/AZURE-DEPLOY.md](docs/AZURE-DEPLOY.md) or run:

```bash
export WYNN_SQL_CONNECTION_STRING='Server=tcp:YOUR_SERVER.database.windows.net,...'
./backend/scripts/deploy-azure-api.sh
```

Uses your existing Azure SQL in `wynn-booking-rg`. Swagger is off in Production; use `/api/health` and `/api/rooms` to verify.
