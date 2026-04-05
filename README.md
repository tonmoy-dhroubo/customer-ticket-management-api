# Ticket Backend (NestJS + PostgreSQL + Mock AI)

Backend for the AI-powered ticket management screening project.

## Features

- User management with roles
- Auth endpoints (register/login with JWT)
- Ticket CRUD + AI-enriched ticket creation
- Customer and category management
- Ticket comments
- Mock AI services:
  - Classification (`Billing`, `Bug`, `Feature Request`, fallback `Support`)
  - Priority inference
  - Summary generation (first 1-2 sentences, max ~150 chars)
  - Assignment suggestion by category

## Tech Stack

- NestJS
- PostgreSQL
- TypeORM
- JWT (passport-jwt)
- class-validator

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Create env file

```bash
cp .env.example .env
```

3. Run app

```bash
npm run start:dev
```

Server starts on `http://localhost:3000`.

## Database Notes

- Default config points to local Postgres.
- `DATABASE_URL` is supported (recommended for Neon/Supabase/Render Postgres).
- `DB_SYNC=true` auto-creates tables in development.
- On startup, default `roles` and `categories` are seeded.
- On startup, a default admin is seeded using `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.

## Auth Notes

- `POST /auth/login` returns JWT access token.
- Most management endpoints are protected with bearer JWT.
- Use `GET /auth/me` to validate token and fetch current user profile.

## Core API Endpoints

- `GET /` health
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (protected)
- `GET /users`, `POST /users`
- `GET /customers`, `GET /customers/:id`, `POST /customers`
- `GET /categories`
- `GET /roles`
- `GET /tickets`, `GET /tickets/:id`, `POST /tickets`, `PATCH /tickets/:id`
- `POST /comments`, `GET /comments/ticket/:ticketId`

## Ticket Creation Flow

`POST /tickets` accepts:

```json
{
  "title": "Payment charged twice",
  "description": "I was charged twice for my monthly plan. Please check urgently.",
  "createdBy": 1,
  "customerId": 2
}
```

Backend flow:

1. Validate input + creator/customer
2. Run mock AI classification and summary
3. Resolve category + suggested assignment role
4. Save AI results (`ai_confidence`, `ai_source`, `summary`)
5. Persist ticket

## Build & Test

```bash
npm run build
npm test
```

## Seed Demo Data

```bash
npm run seed
```

This resets and repopulates `roles`, `users`, `customers`, `categories`, `tickets`, and `ticket_comments`.
