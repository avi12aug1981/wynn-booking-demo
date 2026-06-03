# Deployment

Deploy **Next.js** and **ASP.NET Core 9** separately; database is **Azure SQL** (EF Core migrations). Prisma/SQLite is not used on this path.

## Components

| Component | Target | Notes |
|-----------|--------|-------|
| Next.js UI | Vercel / Azure Static Web Apps / App Service | Set `NEXT_PUBLIC_BOOKING_API_URL` |
| .NET API | Azure App Service (Linux) | See backend deploy script |
| Database | Azure SQL | Required for API |

## Prerequisites

- Azure subscription
- .NET 9 SDK locally for publish
- Node 20+ for frontend build

## Database (Azure SQL)

Follow [../backend/docs/AZURE-SQL-SETUP.md](../backend/docs/AZURE-SQL-SETUP.md) or:

```bash
export WYNN_SQL_ADMIN_PASSWORD='YourStrong!Passw0rd'
./backend/scripts/provision-azure-sql.sh
```

Apply migrations:

```bash
cd backend/Wynn.Booking.Api
export ASPNETCORE_ENVIRONMENT=Development
dotnet ef database update --project ../Wynn.Booking.Infrastructure
```

## API Deployment

Script: [../backend/scripts/deploy-azure-api.sh](../backend/scripts/deploy-azure-api.sh)

Detail: [../backend/docs/AZURE-DEPLOY.md](../backend/docs/AZURE-DEPLOY.md)

### App Service settings (minimum)

| Setting | Example |
|---------|---------|
| `ConnectionStrings__BookingDatabase` | Azure SQL connection string |
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `Jwt__SecretKey` | 32+ char secret |
| `ApiSecurity__InternalApiKey` | strong key |
| `Cors__AllowedOrigins__0` | `https://your-frontend...` |
| `ReservationEmail__Smtp__User` | optional |
| `ReservationEmail__Smtp__Password` | optional |

Swagger is **off** in Production — verify via `/api/health` and `/api/rooms`.

## Frontend Deployment

```bash
npm run build
```

Set environment:

```text
NEXT_PUBLIC_BOOKING_API_URL=https://your-api.azurewebsites.net
```

Ensure API CORS includes the frontend origin.

## Local Development

```bash
# Terminal 1
cd backend/Wynn.Booking.Api && dotnet run

# Terminal 2
npm install && npm run dev
```

Copy `appsettings.Development.example.json` → `appsettings.Development.json` (gitignored).

## Post-Deploy Verification

1. `GET /api/health` → success envelope
2. `GET /api/rooms?checkInDate=...&checkOutDate=...&guestCount=2`
3. UI search loads rooms
4. Create booking end-to-end

## Related

- [RELIABILITY.md](./RELIABILITY.md)
- [SECURITY.md](./SECURITY.md)
