# Security

## Threat Model (Demo Scope)

This POC targets **demonstration and interview discussion**, not PCI-certified production. The v3 UI talks to **ASP.NET Core** directly (`dotnet-booking-client`); legacy Next.js `app/api/*` Prisma routes are not part of the demo path.

## Authentication

| Mechanism | Use |
|-----------|-----|
| **JWT Bearer** | Demo member sign-in (`POST /api/auth/login`). Claims: `member_id`, email, name, role. |
| **API key** (`x-api-key`) | `POST /api/booking-sessions` only — enforced by `ApiKeyMiddleware` on the .NET API (demo key in UI config; production should proxy server-side). |
| **Anonymous** | Room search, session read by token, confirmation by reference, guest booking create (no JWT). |

Production recommendation: **Microsoft Entra ID** (or Auth0) instead of config-file passwords; Managed Identity for SQL.

## Authorization (`BookingAuthorization`)

Centralized rules prevent IDOR on reservation references:

1. **Confirmation GET** (`/api/bookings/{ref}`)  
   - Guest bookings: anyone with reference can view (email link model).  
   - Logged-in users: must match contact email for guest bookings.  
   - Member bookings: anonymous allowed by reference; signed-in user must own account + email match.

2. **Manage GET** (`/api/bookings/{ref}/manage`)  
   - Requires JWT; `BookingType.Member` and `MemberId` must match token.

3. **History** (`/api/bookings/me`)  
   - Filters to member type + `MemberId` + **contact email equals JWT email** (excludes mis-linked legacy rows).

4. **Modify / Cancel**  
   - Same as history for member bookings; guest bookings require email match.

## Booking Creation Hardening

- **Guest checkout** must not send member JWT (frontend omits `Authorization` on guest POST).
- **Member checkout** only sets `MemberId` when `BookingType = Member`.
- Server validates member name/email against JWT even if client tampers with form (fields are read-only in UI).

## UI Security Notes

- Checkout URLs use **booking session tokens**, not guessable room IDs + query dates alone.
- `/rooms/{id}` without token redirects away (no stale query-string booking).
- Confirmation page hides **Sign In** CTA so email links are not a flow breaker.
- JWT stored in `sessionStorage` (demo); production may use httpOnly cookies + CSRF strategy.

## Transport & Headers

- CORS restricted to configured origins (e.g. `http://localhost:3000`).
- Correlation ID middleware (`X-Correlation-Id`) for audit trails.
- Rate limiting on booking writes (create, cancel).

## Secrets Management

| Secret | Demo | Production |
|--------|------|------------|
| JWT signing key | appsettings | Key Vault / env var |
| SQL password | appsettings.Development.json (gitignored) | Managed Identity |
| SMTP password | appsettings.Development.json | Key Vault |
| API key | appsettings | App Service setting |

**Never commit**

- `appsettings.Development.json` (real SQL, SMTP, or personal demo emails)
- `.env` (SMTP, API URLs with secrets, `NEXT_PUBLIC_DEMO_MEMBER_*` overrides)
- Interview-only docs (gitignored): `docs/INTERVIEW-QA.md`, `docs/PRESENTATION.md`, `docs/DEMO-SCRIPT.md`, and `docs/screenshots/*.{png,jpg,...}`
- Real email addresses or app passwords in `appsettings.json`, `demo-user.ts`, or README examples — use `demo.member@wynn.local` in the repo; override locally only

## Email (MimeKit)

`FromAddress` must be parseable (`Display Name <email@domain.com>` or bare email). Invalid from addresses caused confirmation send failures before parser fix.

## Swagger

Disabled in Production. Use health endpoints and authenticated tests in staging.

## Not in Scope (Say Clearly in Interviews)

- PCI DSS card storage (payment is simulated in UI)
- Webhook signature verification (no webhook yet)
- WAF / APIM policies
- Row-level security in SQL

## Related

- [TECHNICAL-DESIGN.md](./TECHNICAL-DESIGN.md)
- [../backend/docs/BACKEND-ARCHITECTURE.md](../backend/docs/BACKEND-ARCHITECTURE.md)
