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
Next.js Page Gateway
app/[[...segments]]/page.tsx
   |
   v
Feature Route Registry
features/app-router
   |
   +--> Rooms Feature
   +--> Booking Feature
   +--> Confirmation Feature
   +--> Auth Feature
   +--> Reservations Feature
   |
   v
API Layer / Services
   |
   v
ASP.NET Core Web API (primary) · Prisma (legacy/local optional)
   |
   v
Database

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

- SQLite (Local Development)
- Azure SQL (Cloud Deployment)

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

```bash
npm install
npm run dev
```

Application:

```text
http://localhost:3000
```

### Backend API

```bash
cd backend/Wynn.Booking.Api
dotnet run
```

Swagger:

```text
http://localhost:5116/swagger/index.html
```

---

## Documentation

Additional documentation is available under:

```text
docs/
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
| [API-REFERENCE.md](docs/API-REFERENCE.md) | Explain every Swagger endpoint |
| [Architecture.md](docs/Architecture.md) | System overview |
| [SECURITY.md](docs/SECURITY.md) | Auth, secrets, git hygiene |
| [screenshots/README.md](docs/screenshots/README.md) | Screenshot capture checklist (files stay local) |