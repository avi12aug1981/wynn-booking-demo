# Presentation Screenshots

Save captures here before building the deck. Use **PNG** (1440×900 or 1920×1080), browser chrome optional (clean window looks better).

## Capture checklist

Run `npm run dev` and `dotnet run` before capturing.

| # | Filename | What to capture | URL / tool |
|---|----------|-----------------|------------|
| 01 | `01-login-page.png` | Login with Guest + Member cards | `{urls.appBase}/` (see `config/development.defaults.json`) |
| 02 | `02-search-results.png` | Search results with dates filled | `{urls.appBase}/search?...` |
| 03 | `03-room-details-token-url.png` | Room details; **address bar shows** `/rooms/{id}/{BSN_...}` | After Book Now |
| 04 | `04-guest-checkout.png` | Guest checkout form (editable fields) | `/booking/{token}` as guest |
| 05 | `05-guest-confirmation.png` | Confirmation hero + reservation summary | `/confirmation/WYNN-...` |
| 06 | `06-confirmation-email.png` | Gmail (or inbox) confirmation email + **View Confirmation** button | Your inbox |
| 07 | `07-member-signin-topbar.png` | Top bar: name + tier + Logout (no Sign In) | After member login |
| 08 | `08-member-checkout-locked.png` | Checkout with **read-only** profile + helper text | `/booking/{token}` as member |
| 09 | `09-reservation-history.png` | My Reservations list | `{urls.appBase}/reservations` |
| 10 | `10-reservation-detail.png` | Member reservation detail (manage view) | `/reservations/WYNN-...` |
| 11 | `11-swagger-overview.png` | Swagger UI showing controllers/endpoints | `{urls.bookingApi}/swagger` |
| 12 | `12-swagger-bookings.png` | Expanded Bookings + Auth endpoints | Swagger |
| 13 | `13-api-health-or-response.png` | `GET /api/health` 200 or sample JSON envelope with `traceId` | Swagger Try it out |
| 14 | `14-architecture-diagram.png` | Optional: export diagram from draw.io or use slide diagram | — |
| 15 | `15-access-denied-example.png` | Optional: Access Denied when wrong member opens guest ref | For security story |

## Tips

- **macOS:** `Cmd + Shift + 4` → window capture.
- Hide bookmarks bar; use light/dark consistent with deck (app is light content on beige).
- Blur or crop SMTP passwords if any settings screen is captured.
- One screenshot per slide is enough; use two on demo walkthrough slide.

## PowerPoint placement

Slide placement lives in your local `docs/PRESENTATION.md` (gitignored — not pushed to the remote).
