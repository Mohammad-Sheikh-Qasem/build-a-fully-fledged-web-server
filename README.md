# Chirpy - Full-Fledged HTTP Web Server

**Chirpy** is a RESTful HTTP web server built with **Node.js**, **Express**, and **TypeScript**, using **PostgreSQL** with **Drizzle ORM** for data persistence.

It provides a complete system for user management, authentication, posting short text messages ("chirps"), profanity filtering, webhook processing, and admin tooling.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [Database Schema](#️-database-schema)
- [API Reference](#-api-reference)
- [Authentication Flow](#-authentication-flow)
- [Error Handling](#️-error-handling)
- [Testing](#-testing)
- [License](#-license)

---

## Overview

Chirpy simulates a mini social-media platform (similar to Twitter/X), where users can create accounts, log in, and post short text messages called "chirps" (140 characters max). It also supports upgrading accounts to a paid "Chirpy Red" tier via an external webhook from a payment provider (Polka).

---

## 🚀 Features

- **Authentication & Authorization:**
  - Password hashing with `argon2`.
  - Access tokens using **JWT** (JSON Web Tokens), valid for 1 hour.
  - Refresh tokens stored in PostgreSQL with expiration and revocation support, valid for 60 days.
- **User Management:**
  - Create a new account and update account details (email and password).
- **Chirps Management:**
  - Create, fetch (with filtering by author and ascending/descending sort), and delete chirps.
  - Automatic profanity filtering — banned words are replaced with `****`.
  - 140-character max length per chirp.
- **Webhooks & Subscriptions:**
  - A Polka webhook endpoint protected by an API key, used to upgrade users to "Chirpy Red".
- **Database Integration:**
  - Fully managed via **Drizzle ORM** connected to a **PostgreSQL** instance.
  - Automatic migrations applied on server startup.
- **Admin Tools:**
  - A hit counter (metrics).
  - A dev-only endpoint to reset the database.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| [TypeScript](https://www.typescriptlang.org/) | Primary programming language |
| [Node.js](https://nodejs.org/) | Runtime environment |
| [Express.js](https://expressjs.com/) | Web server framework (v5) |
| [PostgreSQL](https://www.postgresql.org/) | Database |
| [Drizzle ORM](https://orm.drizzle.team/) | Database access and migrations |
| `argon2` | Password hashing |
| `jsonwebtoken` | Issuing and verifying JWTs |
| `postgres` (postgres.js) | PostgreSQL client |
| `dotenv` | Environment variable management |
| `vitest` | Test runner |

---

## 📂 Project Structure

```
build-a-fully-fledged-web-server/
├── src/
│   ├── app/                     # Static files served at /app
│   │   ├── assets/logo.png
│   │   └── index.html
│   ├── db/
│   │   ├── migrations/          # SQL migration files
│   │   ├── queries/
│   │   │   ├── users.ts         # User queries
│   │   │   └── chirps.ts        # Chirp queries
│   │   ├── index.ts             # Drizzle connection setup
│   │   └── schema.ts            # Database table definitions
│   ├── auth.ts                  # Auth logic (hashing, JWT, tokens)
│   ├── auth.test.ts             # Auth unit tests
│   ├── config.ts                # App configuration / env variables
│   └── index.ts                 # Main entry point and route definitions
├── drizzle.config.ts             # Drizzle Kit configuration
├── tsconfig.json
├── package.json
└── .env                          # Environment variables (create manually)
```

---

## 📋 Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18+ recommended)
- A [PostgreSQL](https://www.postgresql.org/) database (local or via Docker)
- npm (bundled with Node.js)

---

## 📦 Installation & Setup

1. **Clone the repository:**

```bash
git clone https://github.com/Mohammad-Sheikh-Qasem/build-a-fully-fledged-web-server.git
cd build-a-fully-fledged-web-server
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up the database:**
   Make sure PostgreSQL is running, then create a database named `chirpy` (or any name you configure in `.env`).

4. **Create a `.env` file** as described below.

---

## 🔑 Environment Variables

Create a `.env` file in the project root with the following variables:

```env
DB_URL="postgres://postgres:postgres@localhost:5432/chirpy"
JWT_SECRET="your-super-secret-jwt-key"
POLKA_KEY="your-polka-api-key"
PLATFORM="dev"
```

| Variable | Description |
|---|---|
| `DB_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key used to sign JWTs |
| `POLKA_KEY` | API key used to validate incoming Polka webhook requests |
| `PLATFORM` | Runtime environment (`dev` enables the `/admin/reset` endpoint) |

---

## 🏃 Running the Application

| Command | Description |
|---|---|
| `npm run build` | Compiles TypeScript into JavaScript in `dist/` |
| `npm run dev` | Compiles and runs the server directly (good for development) |
| `npm start` | Runs the server from the pre-built files (`dist/index.js`) |
| `npm test` | Runs the test suite with Vitest |

On startup, the server automatically applies the latest database migrations from `src/db/migrations`, then starts listening at:

```
http://localhost:8080
```

---

## 🗄️ Database Schema

The project defines three main tables via Drizzle ORM:

### `users`
| Field | Type | Description |
|---|---|---|
| `id` | uuid | Primary key (auto-generated) |
| `created_at` / `updated_at` | timestamp | Creation/update timestamps |
| `email` | text | Unique email address |
| `hashed_password` | text | Hashed password |
| `is_chirpy_red` | boolean | Paid subscription status |

### `refresh_tokens`
| Field | Type | Description |
|---|---|---|
| `token` | text | Primary key (the token string itself) |
| `user_id` | uuid | References `users` (cascade delete) |
| `expires_at` | timestamp | Expiration timestamp |
| `revoked_at` | timestamp | Revocation timestamp (if any) |

### `chirps`
| Field | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `body` | text | Message content (140 chars max) |
| `user_id` | uuid | References `users` (cascade delete) |

---

## 📡 API Reference

### General
| Method | Path | Description | Auth required |
|---|---|---|---|
| GET | `/api/healthz` | Health check (returns `OK`) | No |
| GET | `/app` | Serves static files | No |

### Users & Auth
| Method | Path | Description | Auth required |
|---|---|---|---|
| POST | `/api/users` | Create a new user (`email`, `password`) | No |
| PUT | `/api/users` | Update the current user's details | Yes (Bearer JWT) |
| POST | `/api/login` | Log in and issue an access + refresh token | No |
| POST | `/api/refresh` | Issue a new access token using a refresh token | Yes (Bearer refresh token) |
| POST | `/api/revoke` | Revoke a refresh token | Yes (Bearer refresh token) |

### Chirps
| Method | Path | Description | Auth required |
|---|---|---|---|
| POST | `/api/chirps` | Create a new chirp (`body`) | Yes (Bearer JWT) |
| GET | `/api/chirps` | Fetch all chirps (filter with `?authorId=`, sort with `?sort=asc|desc`) | No |
| GET | `/api/chirps/:chirpId` | Fetch a single chirp by ID | No |
| DELETE | `/api/chirps/:chirpId` | Delete a chirp (must be the owner) | Yes (Bearer JWT) |

### Webhooks
| Method | Path | Description | Auth required |
|---|---|---|---|
| POST | `/api/polka/webhooks` | Handles the `user.upgraded` event to upgrade a user to Chirpy Red | Yes (`Authorization: ApiKey <POLKA_KEY>`) |

### Admin
| Method | Path | Description | Notes |
|---|---|---|---|
| GET | `/admin/metrics` | Displays the `/app` hit count as HTML | Always available |
| POST | `/admin/reset` | Resets the hit counter and clears the users table | Only works when `PLATFORM=dev` |

---

## 🔐 Authentication Flow

1. On registration (`/api/users`), the password is hashed with `argon2` before being stored.
2. On login (`/api/login`), the server verifies the password and issues:
   - **Access token (JWT):** valid for 1 hour, used in the `Authorization: Bearer <token>` header.
   - **Refresh token:** a random string stored in the database, valid for 60 days.
3. Once the access token expires, a new one can be obtained via `/api/refresh` using the refresh token.
4. A refresh token can be revoked at any time via `/api/revoke` (useful for logout).
5. The webhook endpoint is protected by a separate API key (`POLKA_KEY`), not the JWT system.

---

## ⚠️ Error Handling

The project uses a centralized error-handling middleware, with custom error types mapped to appropriate HTTP status codes:

| Error type | Status code |
|---|---|
| `BadRequestError` | 400 |
| `UnauthorizedError` | 401 |
| `ForbiddenError` | 403 |
| `NotFoundError` | 404 |
| Any other unexpected error | 500 |

---

## 🧪 Testing

The project includes unit tests for the authentication logic (`src/auth.test.ts`) using **Vitest**. To run them:

```bash
npm test
```

---

## 📄 License

This project is licensed under the **ISC** license.
