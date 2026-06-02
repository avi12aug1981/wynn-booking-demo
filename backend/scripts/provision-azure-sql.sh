#!/usr/bin/env bash
# Creates Azure SQL Server + database for the Wynn Booking API demo.
# Prerequisites: az login (https://aka.ms/azlogin)
#
# Usage:
#   export WYNN_SQL_ADMIN_PASSWORD='YourStrong!Passw0rd'   # required
#   ./backend/scripts/provision-azure-sql.sh
#
# Optional:
#   WYNN_AZURE_RG=wynn-booking-rg   — default (West US 2)
#   WYNN_SQL_LOCATION=westus2       — SQL server region

set -euo pipefail

# Prefer westus2 — eastus / eastus2 often block new SQL servers on this subscription
WYNN_SQL_LOCATION="${WYNN_SQL_LOCATION:-westus2}"
WYNN_AZURE_RG_LOCATION="${WYNN_AZURE_RG_LOCATION:-westus2}"
WYNN_AZURE_RG="${WYNN_AZURE_RG:-wynn-booking-rg}"
# Unique name avoids ghost locks on wynn-booking-demo-sql / sql2 in demo-rg
WYNN_SQL_SERVER_NAME="${WYNN_SQL_SERVER_NAME:-wynn-booking-$(openssl rand -hex 3)}"
WYNN_SQL_DATABASE_NAME="${WYNN_SQL_DATABASE_NAME:-WynnHotelBookingDb_Demo1}"
WYNN_SQL_ADMIN_USER="${WYNN_SQL_ADMIN_USER:-sqladmin}"
WYNN_SQL_ADMIN_PASSWORD="${WYNN_SQL_ADMIN_PASSWORD:-}"

SQL_REGION_FALLBACKS=(
  westus2
  centralus
  westus3
  southcentralus
  eastus2
  northeurope
  westeurope
)

GHOST_SERVER_NAMES=(
  wynn-booking-demo-sql
  wynn-booking-demo-sql2
)

if [[ -z "${WYNN_SQL_ADMIN_PASSWORD}" ]]; then
  echo "Set WYNN_SQL_ADMIN_PASSWORD before running (Azure SQL admin password)."
  echo "Example: export WYNN_SQL_ADMIN_PASSWORD='YourStrong!Passw0rd'"
  exit 1
fi

purge_stuck_sql_server() {
  local name="$1"
  local rg="${2:-${WYNN_AZURE_RG}}"
  echo "Removing stuck SQL server name '${name}' from ${rg} (may not appear in Portal)..."
  az sql server delete --resource-group "${rg}" --name "${name}" --yes 2>/dev/null || true
  az resource delete \
    --resource-group "${rg}" \
    --name "${name}" \
    --resource-type "Microsoft.Sql/servers" 2>/dev/null || true
  sleep 5
}

echo "Checking Azure login..."
az account show >/dev/null || az login

if az group show --name "${WYNN_AZURE_RG}" >/dev/null 2>&1; then
  WYNN_AZURE_RG_LOCATION="$(az group show --name "${WYNN_AZURE_RG}" --query location -o tsv)"
  echo "Resource group ${WYNN_AZURE_RG} already exists (${WYNN_AZURE_RG_LOCATION})."
else
  echo "Creating resource group ${WYNN_AZURE_RG} (${WYNN_AZURE_RG_LOCATION})..."
  az group create --name "${WYNN_AZURE_RG}" --location "${WYNN_AZURE_RG_LOCATION}" --output none
fi

echo "Clearing ghost SQL server names in wynn-booking-demo-rg (if any)..."
for ghost in "${GHOST_SERVER_NAMES[@]}"; do
  purge_stuck_sql_server "${ghost}" "wynn-booking-demo-rg" || true
done

sql_server_exists_in_rg() {
  az resource show \
    --resource-group "${WYNN_AZURE_RG}" \
    --name "${WYNN_SQL_SERVER_NAME}" \
    --resource-type "Microsoft.Sql/servers" \
    >/dev/null 2>&1
}

get_sql_server_location() {
  az resource show \
    --resource-group "${WYNN_AZURE_RG}" \
    --name "${WYNN_SQL_SERVER_NAME}" \
    --resource-type "Microsoft.Sql/servers" \
    --query location -o tsv 2>/dev/null
}

# Returns: 0 = created or reuse, 1 = region full (try next region), 3 = name locked (try next name)
create_sql_server_in_region() {
  local location="$1"
  local err_file
  err_file="$(mktemp)"
  echo "Creating SQL server ${WYNN_SQL_SERVER_NAME} in ${location}..."
  if az sql server create \
    --name "${WYNN_SQL_SERVER_NAME}" \
    --resource-group "${WYNN_AZURE_RG}" \
    --location "${location}" \
    --admin-user "${WYNN_SQL_ADMIN_USER}" \
    --admin-password "${WYNN_SQL_ADMIN_PASSWORD}" \
    --output none 2>"${err_file}"; then
    rm -f "${err_file}"
    WYNN_SQL_LOCATION="${location}"
    return 0
  fi
  if grep -q "RegionDoesNotAllowProvisioning" "${err_file}"; then
    echo "  ${location}: capacity full, trying next region..."
    rm -f "${err_file}"
    return 1
  fi
  if grep -q "InvalidResourceLocation" "${err_file}"; then
    if sql_server_exists_in_rg; then
      WYNN_SQL_LOCATION="$(get_sql_server_location)"
      echo "  Server already registered in ${WYNN_SQL_LOCATION}; continuing setup."
      rm -f "${err_file}"
      return 0
    fi
    echo "  Name '${WYNN_SQL_SERVER_NAME}' is locked in eastus (ghost from failed create; Portal may show empty RG)."
    rm -f "${err_file}"
    return 3
  fi
  cat "${err_file}" >&2
  rm -f "${err_file}"
  return 2
}

provision_sql_server() {
  local server_name="$1"
  WYNN_SQL_SERVER_NAME="${server_name}"

  if sql_server_exists_in_rg; then
    WYNN_SQL_LOCATION="$(get_sql_server_location)"
    echo "SQL server ${WYNN_SQL_SERVER_NAME} already exists (${WYNN_SQL_LOCATION})."
    return 0
  fi

  local regions=("${WYNN_SQL_LOCATION}")
  local region
  for region in "${SQL_REGION_FALLBACKS[@]}"; do
    if [[ "${region}" != "${WYNN_SQL_LOCATION}" ]]; then
      regions+=("${region}")
    fi
  done

  local loc
  for loc in "${regions[@]}"; do
    local code=0
    create_sql_server_in_region "${loc}" || code=$?
    if [[ "${code}" -eq 0 ]]; then
      echo "SQL server ready in ${WYNN_SQL_LOCATION}."
      return 0
    fi
    if [[ "${code}" -eq 3 ]]; then
      WYNN_SQL_SERVER_NAME="wynn-booking-$(openssl rand -hex 3)"
      echo "  Retrying with new server name: ${WYNN_SQL_SERVER_NAME}"
      continue
    fi
    if [[ "${code}" -eq 2 ]]; then
      return 2
    fi
  done

  echo "Could not create SQL server in any tried region."
  return 1
}

code=0
provision_sql_server "${WYNN_SQL_SERVER_NAME}" || code=$?

if [[ "${code}" -ne 0 ]]; then
  echo ""
  echo "Could not provision SQL server."
  echo "Try Portal: ${WYNN_AZURE_RG} → Create → SQL Database → region West US 2 or Central US"
  echo "Or: export WYNN_AZURE_RG=wynn-booking-rg WYNN_SQL_LOCATION=westus2 && ./backend/scripts/provision-azure-sql.sh"
  exit 1
fi

echo "Allowing Azure services (for future App Service deploy)..."
az sql server firewall-rule create \
  --resource-group "${WYNN_AZURE_RG}" \
  --server "${WYNN_SQL_SERVER_NAME}" \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0 \
  --output none 2>/dev/null || true

echo "Detecting your public IPv4 for firewall..."
MY_IP="$(curl -4 -s --max-time 5 https://ifconfig.me 2>/dev/null || curl -4 -s --max-time 5 https://api.ipify.org 2>/dev/null || true)"
if [[ -n "${MY_IP}" ]]; then
  RULE_NAME="AllowClient-$(echo "${MY_IP}" | tr '.' '-')"
  echo "Adding firewall rule for ${MY_IP}..."
  az sql server firewall-rule create \
    --resource-group "${WYNN_AZURE_RG}" \
    --server "${WYNN_SQL_SERVER_NAME}" \
    --name "${RULE_NAME}" \
    --start-ip-address "${MY_IP}" \
    --end-ip-address "${MY_IP}" \
    --output none 2>/dev/null || echo "(rule may already exist)"
else
  echo "Could not detect IPv4. In Portal: SQL server → Networking → Add your client IP."
fi

if az sql db show --name "${WYNN_SQL_DATABASE_NAME}" --server "${WYNN_SQL_SERVER_NAME}" --resource-group "${WYNN_AZURE_RG}" >/dev/null 2>&1; then
  echo "Database ${WYNN_SQL_DATABASE_NAME} already exists."
else
  echo "Creating database ${WYNN_SQL_DATABASE_NAME} (Basic tier)..."
  az sql db create \
    --name "${WYNN_SQL_DATABASE_NAME}" \
    --server "${WYNN_SQL_SERVER_NAME}" \
    --resource-group "${WYNN_AZURE_RG}" \
    --edition Basic \
    --max-size 2GB \
    --output none
fi

FQDN="${WYNN_SQL_SERVER_NAME}.database.windows.net"
CONN="Server=tcp:${FQDN},1433;Initial Catalog=${WYNN_SQL_DATABASE_NAME};User ID=${WYNN_SQL_ADMIN_USER};Password=${WYNN_SQL_ADMIN_PASSWORD};Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

echo ""
echo "========== Azure SQL ready =========="
echo "Resource group:  ${WYNN_AZURE_RG}"
echo "SQL server:      ${FQDN}"
echo "SQL location:    ${WYNN_SQL_LOCATION:-$(az sql server show -n "${WYNN_SQL_SERVER_NAME}" -g "${WYNN_AZURE_RG}" --query location -o tsv 2>/dev/null || echo unknown)}"
echo "Database:        ${WYNN_SQL_DATABASE_NAME}"
echo "Admin user:      ${WYNN_SQL_ADMIN_USER}"
echo ""
echo "Verify DNS:  nslookup ${FQDN}"
echo ""
echo "Paste into backend/Wynn.Booking.Api/appsettings.Development.json:"
echo ""
cat <<EOF
{
  "ConnectionStrings": {
    "BookingDatabase": "${CONN}"
  }
}
EOF
echo ""
echo "Then:"
echo "  cd backend/Wynn.Booking.Api"
echo "  export ASPNETCORE_ENVIRONMENT=Development"
echo "  dotnet ef database update --project ../Wynn.Booking.Infrastructure"
echo "  dotnet run"
