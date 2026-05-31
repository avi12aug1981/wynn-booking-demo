# Architecture Overview

## Technology Stack

- Next.js 15
- TypeScript
- Prisma ORM
- SQLite
- Tailwind CSS

## Architectural Patterns

- Service Layer Pattern
- Repository Pattern
- Atomic Design Pattern
- Dependency Inversion Principle
- Centralized Logging
- API Security Middleware
- Transactional Booking Pattern

## Design Goals

- Extensibility
- Maintainability
- Reusability
- Testability
- Scalability

## Booking Flow

Search Rooms
→ Room Details
→ Booking Session Creation
→ Checkout
→ Final Availability Validation
→ Transaction Commit
→ Confirmation

## Concurrency Strategy

Availability is revalidated inside a database transaction before booking creation.

First successful transaction wins.

Subsequent requests receive a Room Not Available response.