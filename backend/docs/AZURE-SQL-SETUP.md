# Azure SQL setup (Wynn Booking API)

Your earlier connection string used a server hostname that **does not exist in DNS** (`wynndemodatabaseserver.database.windows.net`). Create a new SQL server in Azure, then point the API at it.

## Option A — Script (recommended)

1. Log in to Azure:

```bash
az login
# This project uses subscription "Azure subscription 1"
az account set --subscription "Azure subscription 1"
# Or by ID:
# az account set --subscription d7450805-12b1-42b9-886d-999233aefa44
```

2. Set a strong admin password (Azure rules: 8+ chars, upper, lower, number, symbol):

```bash
export WYNN_SQL_ADMIN_PASSWORD='YourStrong!Passw0rd'
```

3. Run the provision script from the repo root:

```bash
chmod +x backend/scripts/provision-azure-sql.sh
./backend/scripts/provision-azure-sql.sh
```

If the default server name is already taken globally, the script appends a short random suffix.

4. Copy the printed JSON into `backend/Wynn.Booking.Api/appsettings.Development.json` (create the file if needed).

5. Apply schema and run the API:

```bash
cd backend/Wynn.Booking.Api
export ASPNETCORE_ENVIRONMENT=Development
dotnet ef database update --project ../Wynn.Booking.Infrastructure
dotnet run
```

Open `{urls.bookingApi}/swagger` from `config/development.defaults.json` and try `GET /api/health`.

---

## Option B — Azure Portal (click-through)

1. **Create a resource** → **SQL Database** → **Create**.
2. **Resource group**: Create new → `wynn-booking-demo-rg`.
3. **Database name**: `WynnHotelBookingDb_Demo1`.
4. **Server**: Create new server:
   - **Server name**: e.g. `wynn-booking-demo-sql` (must be unique worldwide).
   - **Location**: **East US 2** or **Central US** (avoid **East US** — often full for new SQL servers).
   - **Authentication**: SQL authentication.
   - **Admin login**: `sqladmin`
   - **Password**: strong password (save it).
5. **Compute + storage**: Basic (fine for demo).
6. **Networking** tab (or after create → server → Networking):
   - **Add your client IPv4 address**.
   - Optional: allow **Azure services** if you deploy the API to Azure later.
7. After deployment, open the **SQL server** (not the database) → **Overview** → copy **Server name** (e.g. `wynn-booking-demo-sql.database.windows.net`).

Connection string for `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "BookingDatabase": "Server=tcp:YOUR_SERVER.database.windows.net,1433;Initial Catalog=WynnHotelBookingDb_Demo1;User ID=sqladmin;Password=YOUR_PASSWORD;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
  }
}
```

Verify DNS:

```bash
nslookup YOUR_SERVER.database.windows.net
```

---

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| `RegionDoesNotAllowProvisioning` / East US full | Re-run script (tries eastus2, centralus, westus2, …) or `export WYNN_SQL_LOCATION=westus2` |
| `InvalidResourceGroupLocation` | RG already in `eastus` — script now reuses it; SQL server is created in `eastus2`+ |
| `InvalidResourceLocation` / server stuck in `eastus` | Delete failed server, use new name: see below |

### Stuck SQL server in East US

If the first run left `wynn-booking-demo-sql` in **eastus** but creation failed:

```bash
az sql server delete -g wynn-booking-demo-rg -n wynn-booking-demo-sql --yes
export WYNN_SQL_SERVER_NAME=wynn-booking-demo-sql2
export WYNN_SQL_ADMIN_PASSWORD='YourStrong!Passw0rd'
./backend/scripts/provision-azure-sql.sh
```
| `nodename nor servname provided, or not known` | Wrong server name — copy from Portal Overview |
| Login failed / timeout | Firewall: add your current IP on the **SQL server** |
| `dotnet ef` scary host-abort log | Harmless; real errors appear after that block |
| Migration works but `dotnet run` fails | Same connection string; check `ASPNETCORE_ENVIRONMENT=Development` |

---

## Cost note

Basic tier SQL database is low cost for demos; delete the resource group when finished:

```bash
az group delete --name wynn-booking-demo-rg --yes --no-wait
```
