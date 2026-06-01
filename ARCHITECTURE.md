# Architecture Overview

## Purpose

This project is a hotel room booking proof of concept built with Next.js, TypeScript, Prisma, and SQLite.

The goal is to demonstrate a maintainable booking flow with clear feature ownership, reusable infrastructure, and enough production-oriented design patterns to support future growth.

This is not positioned as a final production deployment. SQLite is used for local/demo execution. A production deployment should use PostgreSQL, Azure SQL, MySQL, or another managed relational database.

---

## Technology Stack

- Next.js 16
- React 19
- TypeScript
- Prisma ORM
- SQLite for local/demo database
- Tailwind CSS
- File-based structured logging for local execution

---

## Architectural Style

The application follows a feature-based vertical slice architecture.

```text
app/
  Next.js routing layer only

features/
  Business capabilities grouped by domain

components/ui/
  Shared reusable UI controls

lib/
  Shared infrastructure and cross-cutting concerns

constants/
  Shared messages, operation names, log events, and security constants

docs/
  Architecture, reliability, security, testing, and deployment notes

  Layer Responsibilities
app/

The app/ directory is used as the Next.js routing and transport layer.

Responsibilities:

Page routes
API route entry points
Layouts
Route parameter handling
Delegation to feature services

API routes should remain thin. They should not contain business logic.

features/

The features/ directory contains business-owned capabilities.

Current features:

features/rooms
features/booking
features/confirmation

Each feature can own:

Components
Services
Repositories
Hooks
Schemas
Types
README documentation

This keeps related business logic close together and avoids scattering one feature across unrelated technical folders.

components/ui/

The components/ui/ directory contains shared reusable UI controls organized using Atomic Design.

components/ui/atoms
components/ui/molecules
components/ui/organisms

Examples:

AppButton
ButtonLoader
AppInput
FormField
FormErrorSummary
Header
Footer

Feature-specific UI should remain inside its feature folder.

lib/

The lib/ directory contains shared infrastructure only.

Current infrastructure areas:

lib/api
lib/logger
lib/security
lib/prisma
lib/availability
lib/testing
lib/utils

Examples:

API response contract
API request handler
Logger abstraction
Security helpers
Repository base contract
Shared utility functions

Business logic should not live in lib/.

Request Flow
Room Search
app/page.tsx
  -> features/rooms/services/room-search-service.ts
  -> features/rooms/services/room-repository.ts
  -> Prisma
  -> SQLite

The room search service applies business transformation such as subtotal calculation and amenities formatting.

The repository owns the persistence query.

Booking Session
features/booking/components/BookNowButton.tsx
  -> app/api/booking-sessions/route.ts
  -> lib/api/handleApiRequest
  -> lib/security/api-key validation
  -> features/booking/services/booking-session-service.ts
  -> Prisma

A booking session represents temporary checkout state. It is separate from a confirmed booking.

Booking Confirmation
features/booking/components/BookingForm.tsx
  -> app/api/bookings/route.ts
  -> lib/api/handleApiRequest
  -> features/booking/services/booking-service.ts
  -> Prisma transaction
  -> Booking + BookingGuest records

The final booking flow performs validation, availability checks, transaction handling, and confirmation creation.

API Standardization

API routes use a common response contract from lib/api/api-response.ts.

Standard response format:

{
  "success": true,
  "data": {}
}

Failure response format:

{
  "success": false,
  "message": "Validation failed.",
  "errors": [],
  "traceId": "..."
}

Benefits:

Predictable frontend error handling
Consistent API shape
Centralized error response behavior
Easier logging and support correlation
Centralized API Handler

API routes use handleApiRequest from lib/api/api-handler.ts.

Responsibilities:

Generate trace IDs
Log request lifecycle events
Catch unhandled exceptions
Return standardized server errors

This prevents duplicated try/catch logic across route handlers.

Logging Strategy

Application logging goes through a logger facade in lib/logger.

Current provider:

Local file logging

Current log file:

logs/application.log

The logger is intentionally provider-based. The application code depends on the logger abstraction, not on a concrete logging vendor.

Future providers could include:

Azure Application Insights
Datadog
Splunk
ELK
Cloud provider log streams
Security Strategy

Current demo security includes:

API key validation for internal API calls
Centralized security constants
Input sanitization helpers
Validation utilities
Rate-limit utility scaffold
Safe public error messages

Production security should include:

Auth provider such as NextAuth, Auth0, or Microsoft Entra ID
Role-based access control
Admin route protection
CSRF protection where applicable
Stronger rate limiting backed by Redis or platform gateway rules
Secret management through cloud key vault or environment configuration

External authentication is intentionally not implemented in this proof of concept.

Repository Pattern

The project uses a repository abstraction to isolate persistence logic from business services.

Current examples:

features/rooms/services/room-repository.ts
features/booking/services/booking-repository.ts
features/booking/services/booking-session-repository.ts
lib/prisma/base-repository.ts

Benefits:

Business services are less coupled to Prisma
Persistence implementation can evolve
Query behavior is centralized
Testing becomes easier through repository substitution

The repository layer does not own business workflows. Business orchestration remains in the service layer.

Transaction Strategy

Final booking creation uses an explicit Prisma transaction with serializable isolation.

This protects the critical booking flow where multiple operations must succeed or fail together:

Lock room
Validate final availability
Create booking
Create booking guests
Consume booking session
Commit transaction

The transaction remains in the service layer because it coordinates multiple business operations.

Availability and Overbooking Prevention

The system checks room availability during search and again during final booking.

Search-time availability is used for user experience.

Final booking availability is used for correctness.

The final booking step revalidates availability inside a transaction before committing the booking. This reduces the risk of stale search results leading to double booking.

Database Strategy

SQLite is used for local/demo execution because it is lightweight and easy to run without external infrastructure.

SQLite is not the recommended production database for a horizontally scaled hotel booking platform.

Production migration path:

Move Prisma provider from SQLite to PostgreSQL, Azure SQL, or MySQL.
Move connection string to secure environment configuration.
Run Prisma migration against production database.
Review indexes for room/date/status search patterns.
Add operational backups and monitoring.
Validate transaction isolation behavior in the selected database engine.

The repository pattern reduces business-layer impact during this migration.

Testing Strategy

The repository includes a testing folder structure for:

tests/e2e
tests/integration/api
lib/testing

Required production tests:

Room availability overlap scenarios
Final booking transaction scenarios
Booking session expiration
Guest capacity validation
Cancellation workflow
API error response consistency
Security validation for protected endpoints

Recommended tooling:

Vitest for unit and service tests
React Testing Library for components
Playwright for end-to-end booking flows
Known Production Gaps

The current project is a proof of concept and intentionally does not include every production concern.

Known gaps:

External authentication and authorization
Production database migration
Payment gateway integration
Distributed rate limiting
Full automated test coverage
Centralized observability platform
CI/CD pipeline
Production secrets management

These are documented as production hardening tasks rather than hidden assumptions.

Design Principles

The project follows these principles:

Keep route handlers thin
Keep feature logic inside feature folders
Keep shared infrastructure in lib
Keep shared UI in components/ui
Use services for business workflows
Use repositories for data access
Use centralized API responses
Use centralized logging
Prefer explicit business rules over hidden framework magic
Summary

The application demonstrates a maintainable booking architecture suitable for a proof of concept.

It includes:

Feature-based vertical slice organization
Shared UI design system foundation
Repository pattern
Centralized API handling
Centralized logging
Security utilities
Booking session flow
Availability checks
Transactional booking creation
Clear migration path for production hardening