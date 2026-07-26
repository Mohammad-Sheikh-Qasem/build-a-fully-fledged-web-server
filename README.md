# Chirpy - HTTP Web Server

Chirpy is a RESTful HTTP web server built with **Node.js**, **Express**, and **TypeScript**, using **PostgreSQL** with **Drizzle ORM** for data persistence. 

It provides endpoints for user management, authentication, posting chirps (short text messages), profanity filtering, webhook processing, and admin management.

---

## 🚀 Features

* **User Authentication & Authorization:**
  * Password hashing using `bcrypt`.
  * Access Tokens using **JWT** (JSON Web Tokens).
  * Refresh Tokens stored in PostgreSQL with expiration and revocation support.
* **Chirps Management:**
  * Create, fetch, filter by author, sort (asc/desc), and delete chirps.
  * Automatic profanity filtering for restricted words.
* **Webhooks & Subscriptions:**
  * Polka Webhook endpoint protected via API Key authentication for upgrading users to "Chirpy Red".
* **Database Integration:**
  * Managed via **Drizzle ORM** connected to a **PostgreSQL** instance.
  * Automatic migrations on startup.
* **Admin Tools:**
  * Admin metrics counter and dev-only database reset endpoint.

---

## 🛠️ Tech Stack

* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Runtime:** [Node.js](https://nodejs.org/)
* **Framework:** [Express.js](https://expressjs.com/)
* **Database:** [PostgreSQL](https://www.postgresql.org/)
* **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
* **Authentication:** JWT, Bcrypt

---

## 📋 Prerequisites

Make sure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v18+ recommended)
* [PostgreSQL](https://www.postgresql.org/) database running locally or via Docker.

---

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/building_a_fully_fledged_web_server.git](https://github.com/your-username/building_a_fully_fledged_web_server.git)
   cd building_a_fully_fledged_web_server
