# Testing

## Backend Integration Tests

Project: `backend/Wynn.Booking.Api.IntegrationTests`

Uses `WebApplicationFactory` with test configuration overrides (demo auth: `demo.member@wynn.local`, API key).

```bash
cd backend
dotnet test
```

### Covered scenarios (examples)

| Test | Asserts |
|------|---------|
| Search with past check-in | 400 Bad Request |
| Create session without API key | 401 Unauthorized |
| Create session with API key | 201 or business validation |
| Login valid / invalid password | 200 / 401 |
| Get member bookings with JWT | 200 envelope |
| Create booking without session token | 400 |
| Invalid JSON body | 400 + traceId in envelope |

Tests require reachable SQL per `appsettings.Development.json` or factory overrides.

## Manual / Demo Testing Checklist

### Guest path

- [ ] Continue as Guest → search → room details (token URL only)
- [ ] Complete booking → confirmation without sign-in
- [ ] Email link opens confirmation (no Sign In in header)
- [ ] Cannot open another guest's confirmation when logged in as member (403)

### Member path

- [ ] Sign in → profile on booking form is read-only
- [ ] Book → confirmation → appears in My Reservations
- [ ] View / modify / cancel rules around check-in date
- [ ] Mis-linked legacy booking not in history list

### API

- [ ] Swagger: all controllers respond
- [ ] `traceId` on error responses grep-able in logs

### Security

- [ ] `/reservations/{other-ref}` denied for wrong member
- [ ] `GET /manage` requires JWT

## Frontend Testing

No automated E2E suite in repo; recommended manual pass before interview:

1. `npm run dev` + `dotnet run`
2. `.env` optional — URL defaults in `config/development.defaults.json` (see `.env.example`)
3. Full guest + member flows above

Optional additions: Playwright for smoke, Vitest for date/auth helpers.

## Local Debugging Tips

```bash
# API log grep
grep "YOUR_TRACE" logs/wynn-booking-audit.jsonl

# Build
cd backend/Wynn.Booking.Api && dotnet build
```

## CI Recommendation

```yaml
# Suggested pipeline steps
- dotnet restore && dotnet build
- dotnet test (with test SQL or container)
- npm ci && npm run build
```

## Related

- Manual walkthrough: guest book → confirmation; member login → reservations (see [API-REFERENCE.md](./API-REFERENCE.md))
- [../backend/README.md](../backend/README.md)
