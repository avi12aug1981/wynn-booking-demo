# Shared configuration

## Local development URLs

**One file:** [`development.defaults.json`](./development.defaults.json)

| Key | Used by |
|-----|---------|
| `urls.appBase` | Next.js (`NEXT_PUBLIC_APP_URL`), API CORS + confirmation links (`ReservationEmail:ClientBaseUrl`) |
| `urls.bookingApi` | Next.js (`NEXT_PUBLIC_BOOKING_API_URL`), Swagger / `launchSettings.json` port |

### Override (do not edit defaults for deploy)

| Layer | Variable / setting |
|-------|-------------------|
| UI | `.env` → `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_BOOKING_API_URL` |
| API | `Cors:AllowedOrigins`, `ReservationEmail:ClientBaseUrl`, or `Cors__AllowedOrigins__0` on Azure |

Production and CI must set these explicitly; committed `appsettings.json` keeps URL fields **empty** so nothing accidentally points at localhost.
