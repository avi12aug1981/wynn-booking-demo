# Deploy Wynn Booking API to Azure

Deploy the **.NET 9** API to **Azure App Service** and point it at your existing **Azure SQL** database (`wynn-booking-6444ea` in `wynn-booking-rg`).

The **Next.js app** is not deployed by this guide (run locally or deploy separately to Vercel / Static Web Apps).

## What you already have

| Resource | Name |
|----------|------|
| Resource group | `wynn-booking-rg` (West US 2) |
| SQL server | `wynn-booking-6444ea.database.windows.net` |
| Database | `WynnHotelBookingDb_Demo1` |
| Firewall | Your IP + Allow Azure services (for App Service) |

## Option A — Deploy script (recommended)

```bash
az login
az account set --subscription "Azure subscription 1"

# Use the same connection string as appsettings.Development.json
export WYNN_SQL_CONNECTION_STRING='Server=tcp:wynn-booking-6444ea.database.windows.net,1433;Initial Catalog=WynnHotelBookingDb_Demo1;User ID=sqladmin;Password=YOUR_PASSWORD;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;'

chmod +x backend/scripts/deploy-azure-api.sh
./backend/scripts/deploy-azure-api.sh
```

Optional fixed app name (must be globally unique):

```bash
export WYNN_WEBAPP_NAME=wynn-booking-api-technoavi
./backend/scripts/deploy-azure-api.sh
```

First deploy takes a few minutes. Migrations run on startup (`DatabaseInitializer`).

### Verify

```bash
curl https://YOUR_APP.azurewebsites.net/api/health
curl "https://YOUR_APP.azurewebsites.net/api/rooms?checkInDate=2026-06-10&checkOutDate=2026-06-12&guestCount=2"
```

## Option B — Azure Portal

1. **Create** → **Web App**
2. Resource group: `wynn-booking-rg`
3. Name: e.g. `wynn-booking-api-demo` (unique)
4. Publish: **Code**, Runtime: **.NET 9 (LTS)**, OS: **Linux**
5. Region: **West US 2** (same as SQL)
6. After create → **Settings** → **Environment variables**:
   - `ASPNETCORE_ENVIRONMENT` = `Production`
   - `ConnectionStrings__BookingDatabase` = your full SQL connection string
7. Deploy code:
   - **Deployment Center** → Local Git / GitHub / ZIP
   - Or from CLI: `az webapp deploy` (see script above)

## SQL firewall

App Service must reach SQL Server:

- **Networking** on SQL server → ensure **Allow Azure services and resources** is enabled (the provision script added `AllowAzureServices`).

If health check fails with timeout, add the App Service **outbound IP addresses** (App Service → **Properties** → outbound IPs) to the SQL firewall.

## Production behavior

| Setting | Value |
|---------|--------|
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| Swagger | Off (see `Program.cs`) |
| Migrations + seed | On startup if DB empty |

To enable Swagger in Azure for a demo slot, use a separate **Staging** slot with `ASPNETCORE_ENVIRONMENT=Staging` and adjust `Program.cs` if needed.

## Connect Next.js UI

In the React app `.env` (or hosting env vars):

```env
NEXT_PUBLIC_BOOKING_API_URL=https://YOUR_APP.azurewebsites.net
```

Set **`Cors__AllowedOrigins__0`** (or `Cors:AllowedOrigins` in config) to your frontend URL — CORS is already configured in `Program.cs`.

The UI calls the .NET API directly via `lib/api/dotnet-booking-client.ts`, including **`x-api-key`** on `POST /api/booking-sessions` (see `ApiKeyMiddleware`).

## API security in Azure

Demo posture today: JWT for members, API key on session create, rate limits on writes. For production:

- **Entra ID (Azure AD) JWT** instead of config-file demo users
- **API Management** in front of App Service
- **Managed identity** to SQL instead of SQL user/password in app settings
- Move **`x-api-key`** to a server-side BFF so the key is not exposed in the browser

## Cost / cleanup

- App Service **B1** ~ low monthly cost for demos
- Delete when done:

```bash
az webapp delete -g wynn-booking-rg -n YOUR_WEBAPP_NAME
az appservice plan delete -g wynn-booking-rg -n wynn-booking-plan --yes
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 500 on `/api/health` | Check connection string in App Settings; SQL firewall |
| App won’t start | `az webapp log tail -g wynn-booking-rg -n YOUR_APP` |
| Runtime not found | Use Linux plan with `DOTNETCORE:9.0` |
| 404 on all routes | Wrong deploy package; redeploy with script |
