# Secure Firebase Express Backend

Production-ready Node.js + Express API with Firebase Admin SDK, strong security defaults, structured logging, validation, and tests.

## Features

- Express 4 with robust app structure
- Firebase Admin SDK (Auth + Firestore ready)
- Security middleware: Helmet, CORS (allowlist), HPP, rate limiting, request size limits, compression
- Pino HTTP logging with request correlation id
- Centralized error handling with consistent JSON error shape
- Zod validation helper
- Health endpoints (`/health`, `/ready`)
- Example protected route using Firebase ID token (`/v1/me`)
- Tests with Vitest + Supertest
- Dockerfile, ESLint + Prettier, `.env.example`

## Quickstart

```bash
# 1) Clone and install
npm install

# 2) Copy environment config
cp .env.example .env

# 3) Provide Firebase Admin credentials
# Option A) Set FIREBASE_* env vars in .env
# Option B) Provide GOOGLE_APPLICATION_CREDENTIALS pointing to a JSON file

# 4) Run dev
npm run dev
# API: http://localhost:8080
```

### Firebase Credentials

- If using `.env` vars:
  - `FIREBASE_PRIVATE_KEY` must have `\n` for newlines. We replace them at runtime.
- If using a file:
  - `export GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json`

### Auth

Send a Firebase ID token in the Authorization header:

```
Authorization: Bearer <ID_TOKEN>
```

### Scripts

- `npm run dev` – dev mode with nodemon
- `npm start` – production
- `npm test` – run tests
- `npm run lint` – ESLint
- `npm run format` – Prettier

---

## API

- `GET /health` – liveness
- `GET /ready` – readiness (checks Firebase Admin init)
- `GET /v1/me` – **protected**. Verifies Firebase ID token, returns basic user info.

---

## Deploy

Use the provided Dockerfile. Ensure env vars are set in your platform (Heroku, Render, Fly.io, Cloud Run, K8s secrets, etc.).
