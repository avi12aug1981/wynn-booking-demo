#!/usr/bin/env bash
# Deploy Wynn.Booking.Api to Azure App Service (Linux, .NET 9).
#
# Prerequisites:
#   az login
#   az account set --subscription "Azure subscription 1"
#   SQL Server firewall: "Allow Azure services" (provision script adds this)
#
# Usage:
#   export WYNN_SQL_CONNECTION_STRING='Server=tcp:....database.windows.net,...'
#   ./backend/scripts/deploy-azure-api.sh
#
# Optional:
#   WYNN_AZURE_RG=wynn-booking-rg
#   WYNN_APP_PLAN=wynn-booking-plan
#   WYNN_WEBAPP_NAME=wynn-booking-api-demo   # must be globally unique
#   WYNN_AZURE_LOCATION=westus2

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
API_DIR="${ROOT_DIR}/backend/Wynn.Booking.Api"
PUBLISH_DIR="${ROOT_DIR}/backend/publish"
ZIP_PATH="${ROOT_DIR}/backend/deploy.zip"

WYNN_AZURE_RG="${WYNN_AZURE_RG:-wynn-booking-rg}"
WYNN_AZURE_LOCATION="${WYNN_AZURE_LOCATION:-westus2}"
WYNN_APP_PLAN="${WYNN_APP_PLAN:-wynn-booking-plan}"
WYNN_WEBAPP_NAME="${WYNN_WEBAPP_NAME:-wynn-booking-api-$(openssl rand -hex 3)}"
WYNN_SQL_CONNECTION_STRING="${WYNN_SQL_CONNECTION_STRING:-}"

if [[ -z "${WYNN_SQL_CONNECTION_STRING}" ]]; then
  if [[ -f "${API_DIR}/appsettings.Development.json" ]]; then
    WYNN_SQL_CONNECTION_STRING="$(
      python3 -c "
import json, pathlib
p = pathlib.Path('${API_DIR}/appsettings.Development.json')
print(json.loads(p.read_text())['ConnectionStrings']['BookingDatabase'])
" 2>/dev/null || true
    )"
  fi
fi

if [[ -z "${WYNN_SQL_CONNECTION_STRING}" ]]; then
  echo "Set WYNN_SQL_CONNECTION_STRING (Azure SQL connection string)."
  exit 1
fi

echo "Checking Azure login..."
az account show >/dev/null || az login

echo "Ensuring resource group ${WYNN_AZURE_RG}..."
if ! az group show --name "${WYNN_AZURE_RG}" >/dev/null 2>&1; then
  az group create --name "${WYNN_AZURE_RG}" --location "${WYNN_AZURE_LOCATION}" --output none
fi

if ! az appservice plan show --name "${WYNN_APP_PLAN}" --resource-group "${WYNN_AZURE_RG}" >/dev/null 2>&1; then
  echo "Creating App Service plan ${WYNN_APP_PLAN} (B1 Linux)..."
  az appservice plan create \
    --name "${WYNN_APP_PLAN}" \
    --resource-group "${WYNN_AZURE_RG}" \
    --location "${WYNN_AZURE_LOCATION}" \
    --sku B1 \
    --is-linux \
    --output none
fi

if ! az webapp show --name "${WYNN_WEBAPP_NAME}" --resource-group "${WYNN_AZURE_RG}" >/dev/null 2>&1; then
  echo "Creating Web App ${WYNN_WEBAPP_NAME} (.NET 9)..."
  az webapp create \
    --name "${WYNN_WEBAPP_NAME}" \
    --resource-group "${WYNN_AZURE_RG}" \
    --plan "${WYNN_APP_PLAN}" \
    --runtime "DOTNETCORE:9.0" \
    --output none
else
  echo "Web App ${WYNN_WEBAPP_NAME} already exists."
fi

echo "Configuring app settings..."
az webapp config appsettings set \
  --name "${WYNN_WEBAPP_NAME}" \
  --resource-group "${WYNN_AZURE_RG}" \
  --settings \
    ASPNETCORE_ENVIRONMENT=Production \
    "ConnectionStrings__BookingDatabase=${WYNN_SQL_CONNECTION_STRING}" \
  --output none

echo "Publishing API (Release)..."
rm -rf "${PUBLISH_DIR}" "${ZIP_PATH}"
dotnet publish "${API_DIR}/Wynn.Booking.Api.csproj" -c Release -o "${PUBLISH_DIR}" --no-self-contained

echo "Creating deployment package..."
(cd "${PUBLISH_DIR}" && zip -qr "${ZIP_PATH}" .)

echo "Deploying to Azure..."
az webapp deploy \
  --resource-group "${WYNN_AZURE_RG}" \
  --name "${WYNN_WEBAPP_NAME}" \
  --src-path "${ZIP_PATH}" \
  --type zip \
  --async true

HOSTNAME="$(az webapp show --name "${WYNN_WEBAPP_NAME}" --resource-group "${WYNN_AZURE_RG}" --query defaultHostName -o tsv)"

echo ""
echo "========== Deployed =========="
echo "URL:          https://${HOSTNAME}"
echo "Health:       https://${HOSTNAME}/api/health"
echo "Rooms:        https://${HOSTNAME}/api/rooms?checkInDate=2026-06-10&checkOutDate=2026-06-12&guestCount=2"
echo "Swagger:      disabled in Production (ASPNETCORE_ENVIRONMENT=Production)"
echo ""
echo "Save for later:"
echo "  export WYNN_WEBAPP_NAME=${WYNN_WEBAPP_NAME}"
echo ""
echo "View logs:"
echo "  az webapp log tail -g ${WYNN_AZURE_RG} -n ${WYNN_WEBAPP_NAME}"
