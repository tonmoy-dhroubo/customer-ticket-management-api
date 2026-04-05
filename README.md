# Ticket Backend (NestJS + PostgreSQL + Gemini AI)

Backend for the AI-powered ticket management screening project.

## Features

- User management with roles
- Auth endpoints (register/login with JWT)
- Ticket CRUD + AI-enriched ticket creation
- Customer and category management
- Ticket comments
- AI services:
  - Gemini-powered classification + summary generation
  - Deterministic fallback if Gemini is unavailable
  - Category set: `Billing`, `Bug`, `Feature Request`, fallback `Support`
  - Priority inference + assignment suggestion by category

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
- `DB_SYNC=false` is recommended for production.
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
2. Run AI classification and summary
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

## Deploy To Railway (Detailed)

### 1. Push API code

Make sure this backend repo is pushed to GitHub:

- `git@github.com:tonmoy-dhroubo/customer-ticket-management-api.git`

### 2. Create Railway project

1. Log in to Railway.
2. Click `New Project`.
3. Select `Deploy from GitHub repo`.
4. Choose `customer-ticket-management-api`.
5. Railway will create one service for this repo.

### 3. Set build/start commands

In service settings:

- Build Command: `npm install && npm run build`
- Start Command: `npm run start:prod`

### 4. Set environment variables

Add these in Railway `Variables` tab:

- `DATABASE_URL` = your Neon/Postgres connection string
- `JWT_SECRET` = strong random secret
- `JWT_EXPIRES_IN` = `7d`
- `GEMINI_API_KEY` = your Google AI Studio API key
- `GEMINI_MODEL` = `gemini-2.5-flash`
- `DB_SYNC` = `false`
- `ADMIN_NAME` = `System Admin`
- `ADMIN_EMAIL` = `admin@ticket.local`
- `ADMIN_PASSWORD` = `admin123456` (change in production)

Do not set `PORT`; Railway provides it automatically.

### 5. Deploy

1. Trigger a deploy (or it auto-deploys after variable save).
2. Open logs and confirm:
   - app starts successfully
   - database connection succeeds

### 6. Verify API

Use your Railway public URL:

- `GET /` should return health response
- `POST /auth/login` with admin credentials should return JWT
- `GET /auth/me` with bearer token should return current user

### 7. Optional: seed demo data

`npm run seed` truncates and repopulates tables. Use only when you intentionally want demo reset.
