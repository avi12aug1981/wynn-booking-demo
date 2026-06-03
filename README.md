# Wynn Booking Demo
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![.NET](https://img.shields.io/badge/.NET-9-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Azure](https://img.shields.io/badge/Azure-Ready-0078D4)
Modern hotel room booking demo built for a Senior Lead .NET Full Stack Developer review.

The application demonstrates luxury room search, availability validation, booking-session workflow, guest/member booking journeys, reservation management, email notification capability, and a supporting ASP.NET Core Web API backend.

## Highlights

- Feature-based application architecture
- Single Page Gateway using Next.js catch-all routing
- Rooms, Booking, Confirmation, Auth, and Reservations feature modules
- Guest booking and demo member booking flows
- Booking session token workflow
- Room availability overlap validation
- Reservation history, modify, and cancel demo pages
- Email notification capability
- ASP.NET Core Web API backend with Swagger
- Azure SQL provisioning scripts
- Security, reliability, availability, and architecture documentation

## Architecture

```text
Browser
   |
   v
Next.js Page Gateway (features/app-router)
   |
   v
lib/api/dotnet-booking-client.ts  (REST + JWT + x-api-key)
   |
   v
ASP.NET Core 9 Web API  (:5116, Swagger in dev)
   |
   v
EF Core 9  →  Azure SQL / SQL Server
```

See [ARCHITECTURE.md](ARCHITECTURE.md), [docs/Architecture.md](docs/Architecture.md), and [docs/README.md](docs/README.md).

Legacy `prisma/` + SQLite + `app/api/*` Prisma routes remain from an earlier spike; **the v3 demo uses only the .NET API.**

## Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- ASP.NET Core Web API
- Swagger / OpenAPI
- Azure SQL
- Entity Framework Core

### Database

- **Azure SQL / SQL Server** (primary — EF Core, demo and cloud)
- SQLite + Prisma (legacy POC only; not used for v3 demo path)

---

## Main User Flows

### Guest Booking Flow

```text
Search Rooms
    ↓
Room Details
    ↓
Book Now
    ↓
Booking Session
    ↓
Complete Reservation
    ↓
Confirmation
```

### Member Booking Flow

```text
Login
    ↓
Reservation History
    ↓
View Reservation
    ↓
Modify Reservation
    ↓
Cancel Reservation
```

---

## Running the Application

### Frontend

Requires **Node.js 20.9+** (Next.js 16). If `node -v` shows 18.x, use nvm:

```bash
nvm use    # reads .nvmrc → 20
# or: nvm install 20 && nvm use 20

npm install
npm run dev
```

UI URL: [`config/development.defaults.json`](config/development.defaults.json) → `urls.appBase` (override with `NEXT_PUBLIC_APP_URL` in `.env`).

### Backend API

```bash
cd backend/Wynn.Booking.Api
dotnet run
```

Swagger: `urls.bookingApi` + `/swagger` in [`config/development.defaults.json`](config/development.defaults.json).

---

## Documentation

Additional documentation is available under:

```text
docs/
├── README.md              # Index + v3 stack
├── Architecture.md
├── TECHNICAL-DESIGN.md
├── SECURITY.md
├── AVAILABILITY-RULES.md
├── RELIABILITY.md
├── TESTING.md
├── DEPLOYMENT.md
├── DesignPatterns.md
├── FolderStructure.md
├── API-REFERENCE.md     # Swagger cheat sheet
└── screenshots/         # Capture guide (images stay local)
```

### What not to commit

Keep these **local only** (listed in `.gitignore`):

- `docs/INTERVIEW-QA.md`, `docs/PRESENTATION.md`, `docs/DEMO-SCRIPT.md`
- Screenshot PNGs under `docs/screenshots/`
- `.env`, `appsettings.Development.json`, real SMTP/SQL credentials

Default demo sign-in in the repo: `demo.member@wynn.local` / `demo.member`. For your own email or inbox testing, copy `appsettings.Development.example.json` → `appsettings.Development.json` and set `NEXT_PUBLIC_DEMO_MEMBER_*` in `.env` — do not push those files.

### Documentation (in repo)

| Doc | Use |
|-----|-----|
| [docs/README.md](docs/README.md) | Doc index + v3 stack summary |
| [docs/Architecture.md](docs/Architecture.md) | System overview (.NET + Azure SQL) |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Frontend flows + legacy Prisma note |
| [backend/README.md](backend/README.md) | Run API, migrations, Swagger |
| [docs/API-REFERENCE.md](docs/API-REFERENCE.md) | Swagger endpoint cheat sheet |
| [docs/SECURITY.md](docs/SECURITY.md) | Auth, secrets, git hygiene |
| [screenshots/README.md](docs/screenshots/README.md) | Screenshot capture checklist (files stay local) |